import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAgeCriterion,
  createGenderCriterion,
  createConditionCriterion,
  createCustomConditionCriterion,
  createObservationCriterion,
  createCustomObservationCriterion,
  resetCriterionCounter,
} from './cohort-criteria-factory';
import { SNOMED_SYSTEM, LOINC_SYSTEM } from '../types/fhir-codes.types';

describe('cohort-criteria-factory', () => {
  beforeEach(() => {
    resetCriterionCounter();
  });

  describe('createAgeCriterion', () => {
    it('should create age criterion with min and max', () => {
      const criterion = createAgeCriterion(40, 65);

      expect(criterion.id).toBe('age-1');
      expect(criterion.type).toBe('age');
      expect(criterion.minAge).toBe(40);
      expect(criterion.maxAge).toBe(65);
    });

    it('should create age criterion with only min', () => {
      const criterion = createAgeCriterion(18);

      expect(criterion.minAge).toBe(18);
      expect(criterion.maxAge).toBeUndefined();
    });

    it('should create age criterion with only max', () => {
      const criterion = createAgeCriterion(undefined, 100);

      expect(criterion.minAge).toBeUndefined();
      expect(criterion.maxAge).toBe(100);
    });

    it('should generate unique ids', () => {
      const criterion1 = createAgeCriterion(20);
      const criterion2 = createAgeCriterion(30);

      expect(criterion1.id).toBe('age-1');
      expect(criterion2.id).toBe('age-2');
    });
  });

  describe('createGenderCriterion', () => {
    it('should create gender criterion with default value', () => {
      const criterion = createGenderCriterion();

      expect(criterion.id).toBe('gender-1');
      expect(criterion.type).toBe('gender');
      expect(criterion.value).toBe('any');
    });

    it('should create gender criterion with specified value', () => {
      const criterion = createGenderCriterion('female');

      expect(criterion.value).toBe('female');
    });

    it('should support all gender values', () => {
      const genders = ['male', 'female', 'other', 'unknown', 'any'] as const;

      for (const gender of genders) {
        resetCriterionCounter();
        const criterion = createGenderCriterion(gender);
        expect(criterion.value).toBe(gender);
      }
    });
  });

  describe('createConditionCriterion', () => {
    it('should create hypertension condition', () => {
      const criterion = createConditionCriterion('hypertension');

      expect(criterion.id).toBe('condition-1');
      expect(criterion.type).toBe('condition');
      expect(criterion.code).toBe('59621000');
      expect(criterion.display).toBe('Hypertension');
      expect(criterion.system).toBe(SNOMED_SYSTEM);
    });

    it('should create diabetes condition', () => {
      const criterion = createConditionCriterion('diabetes');

      expect(criterion.code).toBe('44054006');
      expect(criterion.display).toBe('Diabetes');
    });

    it('should create heart failure condition', () => {
      const criterion = createConditionCriterion('heartFailure');

      expect(criterion.code).toBe('84114007');
      expect(criterion.display).toBe('Heart failure');
    });
  });

  describe('createCustomConditionCriterion', () => {
    it('should create custom condition with default system', () => {
      const criterion = createCustomConditionCriterion(
        '195967001',
        'Asthma'
      );

      expect(criterion.code).toBe('195967001');
      expect(criterion.display).toBe('Asthma');
      expect(criterion.system).toBe(SNOMED_SYSTEM);
    });

    it('should create custom condition with custom system', () => {
      const customSystem = 'http://hl7.org/fhir/sid/icd-10-cm';
      const criterion = createCustomConditionCriterion(
        'J45',
        'Asthma',
        customSystem
      );

      expect(criterion.system).toBe(customSystem);
    });
  });

  describe('createObservationCriterion', () => {
    it('should create BMI observation', () => {
      const criterion = createObservationCriterion('bmi', 'gt', 30);

      expect(criterion.id).toBe('observation-1');
      expect(criterion.type).toBe('observation');
      expect(criterion.code).toBe('39156-5');
      expect(criterion.display).toBe('BMI');
      expect(criterion.system).toBe(LOINC_SYSTEM);
      expect(criterion.comparator).toBe('gt');
      expect(criterion.value).toBe(30);
      expect(criterion.unit).toBe('kg/m2');
    });

    it('should create systolic BP observation', () => {
      const criterion = createObservationCriterion('systolicBp', 'ge', 140);

      expect(criterion.code).toBe('8480-6');
      expect(criterion.display).toBe('Systolic BP');
      expect(criterion.comparator).toBe('ge');
      expect(criterion.value).toBe(140);
      expect(criterion.unit).toBe('mmHg');
    });

    it('should support all comparators', () => {
      const comparators = ['eq', 'gt', 'lt', 'ge', 'le'] as const;

      for (const comparator of comparators) {
        resetCriterionCounter();
        const criterion = createObservationCriterion('bmi', comparator, 25);
        expect(criterion.comparator).toBe(comparator);
      }
    });
  });

  describe('createCustomObservationCriterion', () => {
    it('should create custom observation with default system', () => {
      const criterion = createCustomObservationCriterion(
        '12345-6',
        'Custom Lab',
        'lt',
        100,
        'mg/dL'
      );

      expect(criterion.code).toBe('12345-6');
      expect(criterion.display).toBe('Custom Lab');
      expect(criterion.system).toBe(LOINC_SYSTEM);
      expect(criterion.comparator).toBe('lt');
      expect(criterion.value).toBe(100);
      expect(criterion.unit).toBe('mg/dL');
    });

    it('should create custom observation without unit', () => {
      const criterion = createCustomObservationCriterion(
        '12345-6',
        'Custom Score',
        'eq',
        5
      );

      expect(criterion.unit).toBeUndefined();
    });
  });

  describe('resetCriterionCounter', () => {
    it('should reset the counter', () => {
      createAgeCriterion(20);
      createAgeCriterion(30);

      resetCriterionCounter();

      const criterion = createAgeCriterion(40);
      expect(criterion.id).toBe('age-1');
    });
  });
});
