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
    <div className="bg-white border-t border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Query Preview</h3>
        <button
          onClick={onToggleExpand}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          aria-label={isExpanded ? 'Collapse query preview' : 'Expand query preview'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-3">
            <code className="text-sm text-gray-800 break-all whitespace-pre-wrap font-mono">
              {query}
            </code>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Copy query to clipboard"
          >
            {copySuccess ? 'Copied!' : 'Copy Query'}
          </button>
        </div>
      )}
    </div>
  );
}
