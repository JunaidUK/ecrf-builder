import { useState, useEffect, useRef, useCallback } from 'react';
import { searchConditionsWithICD10, type ICD10SearchResult } from '../../../services/terminology-client';

interface ConditionAutocompleteProps {
  onSelect: (result: ICD10SearchResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ConditionAutocomplete({
  onSelect,
  placeholder = 'Search for a condition...',
  disabled = false,
}: ConditionAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ICD10SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchConditionsWithICD10(term, 15);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setHighlightedIndex(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, performSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(result: ICD10SearchResult) {
    onSelect(result);
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className="condition-autocomplete">
      <div className="autocomplete-input-container">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="autocomplete-input"
          aria-label="Search for condition"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {isLoading && (
          <span className="autocomplete-spinner" aria-label="Searching">
            ...
          </span>
        )}
      </div>

      {error && (
        <div className="autocomplete-error" role="alert">
          {error}
        </div>
      )}

      {isOpen && results.length > 0 && (
        <ul
          className="autocomplete-results"
          role="listbox"
          aria-label="Search results"
        >
          {results.map((result, index) => (
            <li
              key={`${result.snomedCode}-${result.icd10Code}`}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`autocomplete-result-item ${
                index === highlightedIndex ? 'highlighted' : ''
              }`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="result-condition">{result.snomedDisplay}</div>
              <div className="result-codes">
                <span className="icd10-code">{result.icd10Code}</span>
                <span className="snomed-code">SNOMED: {result.snomedCode}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .condition-autocomplete {
          position: relative;
          width: 100%;
        }

        .autocomplete-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .autocomplete-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .autocomplete-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .autocomplete-input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .autocomplete-spinner {
          position: absolute;
          right: 12px;
          color: #6b7280;
        }

        .autocomplete-error {
          margin-top: 4px;
          font-size: 12px;
          color: #dc2626;
        }

        .autocomplete-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin: 4px 0 0 0;
          padding: 0;
          list-style: none;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          max-height: 300px;
          overflow-y: auto;
          z-index: 50;
        }

        .autocomplete-result-item {
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
        }

        .autocomplete-result-item:last-child {
          border-bottom: none;
        }

        .autocomplete-result-item:hover,
        .autocomplete-result-item.highlighted {
          background-color: #f3f4f6;
        }

        .result-condition {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 4px;
        }

        .result-codes {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }

        .icd10-code {
          color: #059669;
          font-weight: 600;
          font-family: monospace;
        }

        .snomed-code {
          color: #6b7280;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
