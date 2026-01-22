import { describe, it, expect } from 'vitest';
import {
  validateTitle,
  validateStatus,
  validateQuestionnaireForm,
} from './questionnaire-validators';
import type { QuestionnaireFormState } from '../types/questionnaire.types';

describe('validateTitle', () => {
  it('should return null for valid names', () => {
    expect(validateTitle('Type 2 Diabetes')).toBeNull();
    expect(validateTitle('COVID-19 Survey')).toBeNull();
    expect(validateTitle('abc')).toBeNull();
  });

  it('should return error for empty name', () => {
    expect(validateTitle('')).toBe('Title is required');
    expect(validateTitle('   ')).toBe('Title is required');
  });

  it('should return error for titles less than 3 characters', () => {
    expect(validateTitle('ab')).toBe('Title must be at least 3 characters');
    expect(validateTitle('a')).toBe('Title must be at least 3 characters');
  });
});

describe('validateStatus', () => {
  it('should return null for valid statuses', () => {
    expect(validateStatus('draft')).toBeNull();
    expect(validateStatus('active')).toBeNull();
    expect(validateStatus('retired')).toBeNull();
    expect(validateStatus('unknown')).toBeNull();
  });

  it('should return error for empty status', () => {
    expect(validateStatus('')).toBe('Status is required');
  });

  it('should return error for invalid status', () => {
    expect(validateStatus('invalid')).toBe('Status must be draft, active, retired, or unknown');
    expect(validateStatus('pending')).toBe('Status must be draft, active, retired, or unknown');
  });
});

describe('validateQuestionnaireForm', () => {
  it('should return empty errors for valid form', () => {
    const form: QuestionnaireFormState = {
      title: 'Type 2 Diabetes',
      status: 'draft',
    };
    const errors = validateQuestionnaireForm(form);
    expect(errors).toEqual({});
  });

  it('should return title error for invalid title', () => {
    const form: QuestionnaireFormState = {
      title: '',
      status: 'draft',
    };
    const errors = validateQuestionnaireForm(form);
    expect(errors.title).toBe('Title is required');
    expect(errors.status).toBeUndefined();
  });

  it('should return both errors when both fields invalid', () => {
    const form = {
      title: '',
      status: '' as 'draft',
    };
    const errors = validateQuestionnaireForm(form);
    expect(errors.title).toBe('Title is required');
    expect(errors.status).toBe('Status is required');
  });
});
