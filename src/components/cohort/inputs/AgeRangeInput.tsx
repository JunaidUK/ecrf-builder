import type { ReactNode } from 'react';
import type { AgeCriterion } from '../../../types/cohort.types';

interface AgeRangeInputProps {
  criterion: AgeCriterion;
  onChange: (updates: Partial<AgeCriterion>) => void;
}

export function AgeRangeInput({
  criterion,
  onChange,
}: AgeRangeInputProps): ReactNode {
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const minAge = value === '' ? undefined : parseInt(value, 10);
    onChange({ minAge });
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const maxAge = value === '' ? undefined : parseInt(value, 10);
    onChange({ maxAge });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label
          htmlFor={`${criterion.id}-min`}
          className="text-sm text-gray-600"
        >
          Min:
        </label>
        <input
          id={`${criterion.id}-min`}
          type="number"
          min={0}
          max={150}
          value={criterion.minAge ?? ''}
          onChange={handleMinChange}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0"
          aria-label="Minimum age"
        />
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={`${criterion.id}-max`}
          className="text-sm text-gray-600"
        >
          Max:
        </label>
        <input
          id={`${criterion.id}-max`}
          type="number"
          min={0}
          max={150}
          value={criterion.maxAge ?? ''}
          onChange={handleMaxChange}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="150"
          aria-label="Maximum age"
        />
      </div>
    </div>
  );
}
