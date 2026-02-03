import type { ReactNode } from 'react';
import type { SearchCriterion } from '../../types/cohort.types';
import { CriteriaCard } from './CriteriaCard';

interface CriteriaListProps {
  criteria: SearchCriterion[];
  onUpdateCriterion: (id: string, updates: Partial<SearchCriterion>) => void;
  onRemoveCriterion: (id: string) => void;
}

export function CriteriaList({
  criteria,
  onUpdateCriterion,
  onRemoveCriterion,
}: CriteriaListProps): ReactNode {
  if (criteria.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f8f8f8] via-[#e8e8e8] to-[#d8d8d8] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.1)] border border-white/60 mb-4">
          <span className="text-2xl text-[#888]">+</span>
        </div>
        <p className="text-lg bg-gradient-to-b from-[#555] to-[#888] bg-clip-text text-transparent font-medium">No search criteria added yet</p>
        <p className="text-sm mt-2 text-[#999]">
          Add criteria from the panel on the left to build your cohort search
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold bg-gradient-to-b from-[#333] to-[#666] bg-clip-text text-transparent">Search Criteria</h2>
      <div className="space-y-3">
        {criteria.map((criterion) => (
          <CriteriaCard
            key={criterion.id}
            criterion={criterion}
            onUpdate={onUpdateCriterion}
            onRemove={onRemoveCriterion}
          />
        ))}
      </div>
    </div>
  );
}
