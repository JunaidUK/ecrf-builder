import type { ReactNode } from 'react';
import type { Comparator, ObservationCriterion } from '../../../types/cohort.types';

interface ObservationInputProps {
  criterion: ObservationCriterion;
  onChange: (updates: Partial<ObservationCriterion>) => void;
}

const COMPARATOR_OPTIONS: { value: Comparator; label: string }[] = [
  { value: 'eq', label: '=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'ge', label: '>=' },
  { value: 'le', label: '<=' },
];

export function ObservationInput({
  criterion,
  onChange,
}: ObservationInputProps): ReactNode {
  const handleComparatorChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const comparator = event.target.value as Comparator;
    onChange({ comparator });
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      onChange({ value });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">LOINC:</span>
        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
          {criterion.code}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <select
          id={`${criterion.id}-comparator`}
          value={criterion.comparator}
          onChange={handleComparatorChange}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          aria-label="Select comparator"
        >
          {COMPARATOR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          id={`${criterion.id}-value`}
          type="number"
          step="any"
          value={criterion.value}
          onChange={handleValueChange}
          className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Observation value"
        />
        {criterion.unit && (
          <span className="text-sm text-gray-500">{criterion.unit}</span>
        )}
      </div>
    </div>
  );
}
