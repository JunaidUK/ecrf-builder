export type Gender = 'male' | 'female' | 'other' | 'unknown' | 'any';

export type Comparator = 'eq' | 'gt' | 'lt' | 'ge' | 'le';

export type CriterionType = 'age' | 'gender' | 'condition' | 'observation';

export interface AgeCriterion {
  id: string;
  type: 'age';
  minAge?: number;
  maxAge?: number;
}

export interface GenderCriterion {
  id: string;
  type: 'gender';
  value: Gender;
}

export interface ConditionCriterion {
  id: string;
  type: 'condition';
  code: string;
  display: string;
  system: string;
  clinicalStatus?: 'active' | 'inactive' | 'resolved';
}

export interface ObservationCriterion {
  id: string;
  type: 'observation';
  code: string;
  display: string;
  system: string;
  comparator: Comparator;
  value: number;
  unit?: string;
}

export type SearchCriterion =
  | AgeCriterion
  | GenderCriterion
  | ConditionCriterion
  | ObservationCriterion;

export interface CohortSearchState {
  id: string;
  name: string;
  criteria: SearchCriterion[];
  createdAt: string;
  updatedAt: string;
}
