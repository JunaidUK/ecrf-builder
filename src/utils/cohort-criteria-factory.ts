import type {
  AgeCriterion,
  GenderCriterion,
  ConditionCriterion,
  ObservationCriterion,
  Comparator,
  Gender,
} from '../types/cohort.types';
import {
  PREDEFINED_CONDITIONS,
  PREDEFINED_OBSERVATIONS,
  SNOMED_SYSTEM,
  LOINC_SYSTEM,
} from '../types/fhir-codes.types';

let criterionCounter = 0;

function generateCriterionId(prefix: string): string {
  criterionCounter += 1;
  return `${prefix}-${criterionCounter}`;
}

export function resetCriterionCounter(): void {
  criterionCounter = 0;
}

export function createAgeCriterion(
  minAge?: number,
  maxAge?: number
): AgeCriterion {
  return {
    id: generateCriterionId('age'),
    type: 'age',
    minAge,
    maxAge,
  };
}

export function createGenderCriterion(value: Gender = 'any'): GenderCriterion {
  return {
    id: generateCriterionId('gender'),
    type: 'gender',
    value,
  };
}

export function createConditionCriterion(
  conditionKey: keyof typeof PREDEFINED_CONDITIONS
): ConditionCriterion {
  const condition = PREDEFINED_CONDITIONS[conditionKey];
  return {
    id: generateCriterionId('condition'),
    type: 'condition',
    code: condition.code,
    display: condition.display,
    system: condition.system,
  };
}

export function createCustomConditionCriterion(
  code: string,
  display: string,
  system: string = SNOMED_SYSTEM
): ConditionCriterion {
  return {
    id: generateCriterionId('condition'),
    type: 'condition',
    code,
    display,
    system,
  };
}

export function createObservationCriterion(
  observationKey: keyof typeof PREDEFINED_OBSERVATIONS,
  comparator: Comparator,
  value: number
): ObservationCriterion {
  const observation = PREDEFINED_OBSERVATIONS[observationKey];
  return {
    id: generateCriterionId('observation'),
    type: 'observation',
    code: observation.code,
    display: observation.display,
    system: observation.system,
    comparator,
    value,
    unit: observation.unit,
  };
}

export function createCustomObservationCriterion(
  code: string,
  display: string,
  comparator: Comparator,
  value: number,
  unit?: string,
  system: string = LOINC_SYSTEM
): ObservationCriterion {
  return {
    id: generateCriterionId('observation'),
    type: 'observation',
    code,
    display,
    system,
    comparator,
    value,
    unit,
  };
}
