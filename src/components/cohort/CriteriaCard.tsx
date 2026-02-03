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
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e8e8e8] via-[#ffffff] to-[#d4d4d4] rounded-xl opacity-75 group-hover:opacity-100 transition duration-300 blur-sm"></div>
      <div className="relative bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] rounded-xl border border-white/50 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium bg-gradient-to-b from-[#333] to-[#555] bg-clip-text text-transparent">
              {getCriterionLabel(criterion)}
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] text-[#666] rounded-full border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {getCriterionTypeLabel(criterion.type)}
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 text-[#999] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
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
    </div>
  );
}
