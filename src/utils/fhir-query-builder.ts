import type {
  SearchCriterion,
  AgeCriterion,
  GenderCriterion,
  ConditionCriterion,
  ObservationCriterion,
  Comparator,
} from '../types/cohort.types';
import { ageToBirthdate } from './date-utils';

const COMPARATOR_MAP: Record<Comparator, string> = {
  eq: 'eq',
  gt: 'gt',
  lt: 'lt',
  ge: 'ge',
  le: 'le',
};

function buildAgeParams(criterion: AgeCriterion): string[] {
  const params: string[] = [];

  if (criterion.minAge !== undefined) {
    // Min age means birthdate must be <= (today - minAge years)
    const maxBirthdate = ageToBirthdate(criterion.minAge, 'min');
    params.push(`birthdate=le${maxBirthdate}`);
  }

  if (criterion.maxAge !== undefined) {
    // Max age means birthdate must be >= (today - (maxAge + 1) years + 1 day)
    const minBirthdate = ageToBirthdate(criterion.maxAge, 'max');
    params.push(`birthdate=ge${minBirthdate}`);
  }

  return params;
}

function buildGenderParam(criterion: GenderCriterion): string[] {
  if (criterion.value === 'any') {
    return [];
  }
  return [`gender=${criterion.value}`];
}

function buildConditionParam(criterion: ConditionCriterion): string[] {
  const systemCode = `${criterion.system}|${criterion.code}`;
  const encoded = encodeURIComponent(systemCode);
  return [`_has:Condition:patient:code=${encoded}`];
}

function buildObservationParams(criterion: ObservationCriterion): string[] {
  const systemCode = `${criterion.system}|${criterion.code}`;
  const encodedCode = encodeURIComponent(systemCode);
  const comparator = COMPARATOR_MAP[criterion.comparator];

  return [
    `_has:Observation:patient:code=${encodedCode}`,
    `_has:Observation:patient:value-quantity=${comparator}${criterion.value}`,
  ];
}

function buildParamsForCriterion(criterion: SearchCriterion): string[] {
  switch (criterion.type) {
    case 'age':
      return buildAgeParams(criterion);
    case 'gender':
      return buildGenderParam(criterion);
    case 'condition':
      return buildConditionParam(criterion);
    case 'observation':
      return buildObservationParams(criterion);
    default:
      return [];
  }
}

/**
 * Builds a FHIR search query URL from a list of search criteria.
 */
export function buildFhirQuery(criteria: SearchCriterion[]): string {
  if (criteria.length === 0) {
    return '/Patient';
  }

  const allParams = criteria.flatMap(buildParamsForCriterion);

  if (allParams.length === 0) {
    return '/Patient';
  }

  return `/Patient?${allParams.join('&')}`;
}

/**
 * Builds only the query parameters string (without the /Patient? prefix).
 */
export function buildQueryParams(criteria: SearchCriterion[]): string {
  const allParams = criteria.flatMap(buildParamsForCriterion);
  return allParams.join('&');
}
