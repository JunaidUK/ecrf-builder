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
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No search criteria added yet</p>
        <p className="text-sm mt-2">
          Add criteria from the panel on the left to build your cohort search
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Search Criteria</h2>
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
