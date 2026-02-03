import type { ReactNode } from 'react';
import type { SearchCriterion } from '../../types/cohort.types';
import { AgeRangeInput } from './inputs/AgeRangeInput';
import { GenderSelect } from './inputs/GenderSelect';
import { ConditionInput } from './inputs/ConditionInput';
import { ObservationInput } from './inputs/ObservationInput';

interface CriteriaCardProps {
  criterion: SearchCriterion;
  onUpdate: (id: string, updates: Partial<SearchCriterion>) => void;
  onRemove: (id: string) => void;
}

function getCriterionLabel(criterion: SearchCriterion): string {
  switch (criterion.type) {
    case 'age':
      return 'Age Range';
    case 'gender':
      return 'Gender';
    case 'condition':
      return criterion.display;
    case 'observation':
      return criterion.display;
    default:
      return 'Unknown';
  }
}

function getCriterionTypeLabel(type: SearchCriterion['type']): string {
  switch (type) {
    case 'age':
      return 'age';
    case 'gender':
      return 'gender';
    case 'condition':
      return 'condition';
    case 'observation':
      return 'observation';
    default:
      return 'unknown';
  }
}

export function CriteriaCard({
  criterion,
  onUpdate,
  onRemove,
}: CriteriaCardProps): ReactNode {
  const handleUpdate = (updates: Partial<SearchCriterion>): void => {
    onUpdate(criterion.id, updates);
  };

  const handleRemove = (): void => {
    onRemove(criterion.id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-900">
            {getCriterionLabel(criterion)}
          </h3>
          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
            {getCriterionTypeLabel(criterion.type)}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          aria-label={`Remove ${getCriterionLabel(criterion)} criterion`}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="mt-2">
        {criterion.type === 'age' && (
          <AgeRangeInput criterion={criterion} onChange={handleUpdate} />
        )}
        {criterion.type === 'gender' && (
          <GenderSelect criterion={criterion} onChange={handleUpdate} />
        )}
        {criterion.type === 'condition' && (
          <ConditionInput criterion={criterion} onChange={handleUpdate} />
        )}
        {criterion.type === 'observation' && (
          <ObservationInput criterion={criterion} onChange={handleUpdate} />
        )}
      </div>
    </div>
  );
}
