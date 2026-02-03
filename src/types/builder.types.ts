import type { SearchCriterion } from './cohort.types';

export interface CriteriaPanelProps {
  onAddCriterion: (criterion: SearchCriterion) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface CriteriaCardProps {
  criterion: SearchCriterion;
  onUpdate: (id: string, updates: Partial<SearchCriterion>) => void;
  onRemove: (id: string) => void;
}

export interface CriteriaListProps {
  criteria: SearchCriterion[];
  onUpdateCriterion: (id: string, updates: Partial<SearchCriterion>) => void;
  onRemoveCriterion: (id: string) => void;
}

export interface QueryPreviewPanelProps {
  query: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}
