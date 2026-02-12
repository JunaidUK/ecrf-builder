import type { ReactNode } from 'react';
import type { Gender, GenderCriterion } from '../../../types/cohort.types';

interface GenderSelectProps {
  criterion: GenderCriterion;
  onChange: (updates: Partial<GenderCriterion>) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

export function GenderSelect({
  criterion,
  onChange,
}: GenderSelectProps): ReactNode {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value as Gender;
    onChange({ value });
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={`${criterion.id}-gender`}
        className="text-sm text-gray-600"
      >
        Gender:
      </label>
      <select
        id={`${criterion.id}-gender`}
        value={criterion.value}
        onChange={handleChange}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        aria-label="Select gender"
      >
        {GENDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
