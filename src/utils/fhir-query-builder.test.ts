import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildFhirQuery, buildQueryParams } from './fhir-query-builder';
import type {
  AgeCriterion,
  GenderCriterion,
  ConditionCriterion,
  ObservationCriterion,
  SearchCriterion,
} from '../types/cohort.types';
import { ICD10_SYSTEM, LOINC_SYSTEM } from '../types/fhir-codes.types';

describe('fhir-query-builder', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 28)); // January 28, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('buildFhirQuery', () => {
    it('should return /Patient for empty criteria', () => {
      expect(buildFhirQuery([])).toBe('/Patient');
    });

    describe('age criteria', () => {
      it('should build query for minimum age only', () => {
        const criterion: AgeCriterion = {
          id: '1',
          type: 'age',
          minAge: 40,
        };

        const result = buildFhirQuery([criterion]);
        expect(result).toBe('/Patient?birthdate=le1986-01-28');
      });

      it('should build query for maximum age only', () => {
        const criterion: AgeCriterion = {
          id: '1',
          type: 'age',
          maxAge: 65,
        };

        const result = buildFhirQuery([criterion]);
        expect(result).toBe('/Patient?birthdate=ge1960-01-29');
      });

      it('should build query for age range', () => {
        const criterion: AgeCriterion = {
          id: '1',
          type: 'age',
          minAge: 40,
          maxAge: 65,
        };

        const result = buildFhirQuery([criterion]);
        expect(result).toContain('birthdate=le1986-01-28');
        expect(result).toContain('birthdate=ge1960-01-29');
      });

      it('should return /Patient for age with no min or max', () => {
        const criterion: AgeCriterion = {
          id: '1',
          type: 'age',
        };

        expect(buildFhirQuery([criterion])).toBe('/Patient');
      });
    });

    describe('gender criteria', () => {
      it('should build query for male gender', () => {
        const criterion: GenderCriterion = {
          id: '1',
          type: 'gender',
          value: 'male',
        };

        expect(buildFhirQuery([criterion])).toBe('/Patient?gender=male');
      });

      it('should build query for female gender', () => {
        const criterion: GenderCriterion = {
          id: '1',
          type: 'gender',
          value: 'female',
        };

        expect(buildFhirQuery([criterion])).toBe('/Patient?gender=female');
      });

      it('should skip gender=any', () => {
        const criterion: GenderCriterion = {
          id: '1',
          type: 'gender',
          value: 'any',
        };

        expect(buildFhirQuery([criterion])).toBe('/Patient');
      });
    });

    describe('condition criteria', () => {
      it('should build _has:Condition query with ICD-10 code', () => {
        const criterion: ConditionCriterion = {
          id: '1',
          type: 'condition',
          code: 'I10',
          display: 'Hypertension',
          system: ICD10_SYSTEM,
        };

        const result = buildFhirQuery([criterion]);
        expect(result).toContain('_has:Condition:patient:code=');
        expect(result).toContain(encodeURIComponent(`${ICD10_SYSTEM}|I10`));
      });
    });

    describe('observation criteria', () => {
      it('should build _has:Observation query with LOINC code', () => {
        const criterion: ObservationCriterion = {
          id: '1',
          type: 'observation',
          code: '39156-5',
          display: 'BMI',
          system: LOINC_SYSTEM,
          comparator: 'gt',
          value: 30,
          unit: 'kg/m2',
        };

        const result = buildFhirQuery([criterion]);
        expect(result).toContain('_has:Observation:patient:code=');
        expect(result).toContain(encodeURIComponent(`${LOINC_SYSTEM}|39156-5`));
        expect(result).toContain('_has:Observation:patient:value-quantity=gt30');
      });

      it('should handle different comparators', () => {
        const baseObservation: Omit<ObservationCriterion, 'comparator'> = {
          id: '1',
          type: 'observation',
          code: '8480-6',
          display: 'Systolic BP',
          system: LOINC_SYSTEM,
          value: 140,
          unit: 'mmHg',
        };

        const comparators = ['eq', 'gt', 'lt', 'ge', 'le'] as const;

        for (const comparator of comparators) {
          const criterion: ObservationCriterion = {
            ...baseObservation,
            comparator,
          };
          const result = buildFhirQuery([criterion]);
          expect(result).toContain(`value-quantity=${comparator}140`);
        }
      });
    });

    describe('combined criteria', () => {
      it('should combine multiple criteria with &', () => {
        const criteria: SearchCriterion[] = [
          {
            id: '1',
            type: 'age',
            minAge: 40,
            maxAge: 65,
          },
          {
            id: '2',
            type: 'gender',
            value: 'female',
          },
          {
            id: '3',
            type: 'condition',
            code: 'I10',
            display: 'Hypertension',
            system: ICD10_SYSTEM,
          },
        ];

        const result = buildFhirQuery(criteria);
        expect(result).toContain('birthdate=le1986-01-28');
        expect(result).toContain('birthdate=ge1960-01-29');
        expect(result).toContain('gender=female');
        expect(result).toContain('_has:Condition:patient:code=');
      });
    });
  });

  describe('buildQueryParams', () => {
    it('should return empty string for empty criteria', () => {
      expect(buildQueryParams([])).toBe('');
    });

    it('should return only the params without /Patient?', () => {
      const criterion: GenderCriterion = {
        id: '1',
        type: 'gender',
        value: 'male',
      };

      expect(buildQueryParams([criterion])).toBe('gender=male');
    });
  });
});
