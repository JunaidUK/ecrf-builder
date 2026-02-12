import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Resource } from 'fhir/r4';

interface FhirResourcePanelProps {
  resource: Resource | null;
  onClose: () => void;
}

export function FhirResourcePanel({
  resource,
  onClose,
}: FhirResourcePanelProps): ReactNode {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!resource) {
    return null;
  }

  const resourceType = resource.resourceType;
  const resourceId = resource.id ?? 'unknown';
  const jsonString = JSON.stringify(resource, null, 2);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-100 shadow-2xl z-40 border-t border-gray-700">
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-indigo-600 px-2 py-0.5 rounded">
            FHIR
          </span>
          <span className="text-sm font-medium">
            {resourceType}/{resourceId}
          </span>
          <span className="text-xs text-gray-400">Developer Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(jsonString);
            }}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            aria-label="Copy JSON to clipboard"
          >
            Copy JSON
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            aria-label="Close developer panel"
          >
            Close
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-200"
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-h-64 overflow-auto p-4">
          <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}
