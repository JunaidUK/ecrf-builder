import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('should convert spaces to hyphens', () => {
    expect(slugify('type 2 diabetes')).toBe('type-2-diabetes');
  });

  it('should convert to lowercase', () => {
    expect(slugify('Type 2 Diabetes')).toBe('type-2-diabetes');
  });

  it('should remove special characters', () => {
    expect(slugify('test@#$%form!')).toBe('testform');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('type   2   diabetes')).toBe('type-2-diabetes');
  });

  it('should trim leading and trailing spaces', () => {
    expect(slugify('  test form  ')).toBe('test-form');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('---test---')).toBe('test');
  });

  it('should collapse multiple hyphens', () => {
    expect(slugify('test--form')).toBe('test-form');
  });

  it('should handle numbers', () => {
    expect(slugify('form 123 test')).toBe('form-123-test');
  });

  it('should handle mixed case with numbers and spaces', () => {
    expect(slugify('COVID-19 Patient Survey')).toBe('covid-19-patient-survey');
  });
});
