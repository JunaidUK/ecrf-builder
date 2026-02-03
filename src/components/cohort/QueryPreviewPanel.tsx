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
    <div className="bg-gradient-to-b from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)] border-t border-[var(--chrome-border-default)] flex-shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--chrome-border-light)]">
        <h3 className="text-sm font-semibold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent uppercase tracking-wider">Query Preview</h3>
        <button
          onClick={onToggleExpand}
          className="p-1.5 text-[var(--chrome-text-tertiary)] hover:text-[var(--chrome-text-body)] hover:bg-gradient-to-b hover:from-[var(--chrome-bg-muted)] hover:to-[var(--chrome-bg-inset)] rounded-lg transition-all duration-200"
          aria-label={isExpanded ? 'Collapse query preview' : 'Expand query preview'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--chrome-border-divider)] via-[var(--chrome-bg-accent)] to-[var(--chrome-border-divider)] rounded-xl blur-sm opacity-50"></div>
            <div className="relative bg-gradient-to-br from-[var(--chrome-bg-terminal)] to-[var(--chrome-bg-terminal-dark)] rounded-xl p-4 mb-4 border border-[var(--chrome-border-terminal)]">
              <code className="text-sm text-[var(--chrome-accent-code)] break-all whitespace-pre-wrap font-mono">
                {query}
              </code>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="px-5 py-2 text-sm font-medium bg-gradient-to-b from-[var(--chrome-bg-elevated)] to-[var(--chrome-bg-accent)] text-[var(--chrome-text-body)] rounded-full border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300"
            aria-label="Copy query to clipboard"
          >
            {copySuccess ? 'Copied!' : 'Copy Query'}
          </button>
        </div>
      )}
    </div>
  );
}
