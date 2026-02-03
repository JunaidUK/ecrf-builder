import type { ReactNode } from 'react';
import type { ConditionCriterion } from '../../../types/cohort.types';

interface ConditionInputProps {
  criterion: ConditionCriterion;
  onChange: (updates: Partial<ConditionCriterion>) => void;
}

const CLINICAL_STATUS_OPTIONS: { value: ConditionCriterion['clinicalStatus']; label: string }[] = [
  { value: undefined, label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'resolved', label: 'Resolved' },
];

export function ConditionInput({
  criterion,
  onChange,
}: ConditionInputProps): ReactNode {
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;
    const clinicalStatus = value === '' ? undefined : (value as ConditionCriterion['clinicalStatus']);
    onChange({ clinicalStatus });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">SNOMED:</span>
        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
          {criterion.code}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor={`${criterion.id}-status`}
          className="text-sm text-gray-600"
        >
          Status:
        </label>
        <select
          id={`${criterion.id}-status`}
          value={criterion.clinicalStatus ?? ''}
          onChange={handleStatusChange}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          aria-label="Select clinical status"
        >
          {CLINICAL_STATUS_OPTIONS.map((option) => (
            <option key={option.value ?? 'any'} value={option.value ?? ''}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
