import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface QueryPreviewPanelProps {
  query: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function QueryPreviewPanel({
  query,
  isExpanded,
  onToggleExpand,
}: QueryPreviewPanelProps): ReactNode {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(query);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = query;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [query]);

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-[#f5f5f5] border-t border-[#e0e0e0] flex-shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#e8e8e8]">
        <h3 className="text-sm font-semibold bg-gradient-to-b from-[#333] to-[#666] bg-clip-text text-transparent uppercase tracking-wider">Query Preview</h3>
        <button
          onClick={onToggleExpand}
          className="p-1.5 text-[#888] hover:text-[#555] hover:bg-gradient-to-b hover:from-[#f0f0f0] hover:to-[#e0e0e0] rounded-lg transition-all duration-200"
          aria-label={isExpanded ? 'Collapse query preview' : 'Expand query preview'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d0d0d0] via-[#e8e8e8] to-[#d0d0d0] rounded-xl blur-sm opacity-50"></div>
            <div className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl p-4 mb-4 border border-[#3a3a3a]">
              <code className="text-sm text-[#88d888] break-all whitespace-pre-wrap font-mono">
                {query}
              </code>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="px-5 py-2 text-sm font-medium bg-gradient-to-b from-[#f8f8f8] to-[#e8e8e8] text-[#555] rounded-full border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300"
            aria-label="Copy query to clipboard"
          >
            {copySuccess ? 'Copied!' : 'Copy Query'}
          </button>
        </div>
      )}
    </div>
  );
}
