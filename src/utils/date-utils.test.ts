import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ageToBirthdate, formatDateForFhir, getTodayForFhir } from './date-utils';

describe('date-utils', () => {
  describe('formatDateForFhir', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      expect(formatDateForFhir(date)).toBe('2023-01-15');
    });

    it('should pad single-digit months and days', () => {
      const date = new Date(2023, 5, 5); // June 5, 2023
      expect(formatDateForFhir(date)).toBe('2023-06-05');
    });

    it('should handle December correctly', () => {
      const date = new Date(2023, 11, 31); // December 31, 2023
      expect(formatDateForFhir(date)).toBe('2023-12-31');
    });
  });

  describe('ageToBirthdate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 28)); // January 28, 2026
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should calculate birthdate for minimum age', () => {
      // Age 40 min: born on or before 1986-01-28
      const result = ageToBirthdate(40, 'min');
      expect(result).toBe('1986-01-28');
    });

    it('should calculate birthdate for maximum age', () => {
      // Age 65 max: born on or after 1960-01-29 (66 years ago + 1 day)
      const result = ageToBirthdate(65, 'max');
      expect(result).toBe('1960-01-29');
    });

    it('should handle age 0 for minimum', () => {
      const result = ageToBirthdate(0, 'min');
      expect(result).toBe('2026-01-28');
    });

    it('should handle age 0 for maximum', () => {
      const result = ageToBirthdate(0, 'max');
      expect(result).toBe('2025-01-29');
    });

    it('should handle age 100 correctly', () => {
      const result = ageToBirthdate(100, 'min');
      expect(result).toBe('1926-01-28');
    });
  });

  describe('getTodayForFhir', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 28));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return today formatted for FHIR', () => {
      expect(getTodayForFhir()).toBe('2026-01-28');
    });
  });
});
