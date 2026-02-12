import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CohortSearchProvider, useCohortSearch } from './CohortSearchContext';
import {
  createAgeCriterion,
  createGenderCriterion,
  resetCriterionCounter,
} from '../utils/cohort-criteria-factory';

vi.mock('../services/fhir-client', () => ({
  executeQuery: vi.fn(),
}));

import { executeQuery } from '../services/fhir-client';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CohortSearchProvider>{children}</CohortSearchProvider>;
  };
}

describe('CohortSearchContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 28));
    resetCriterionCounter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useCohortSearch', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useCohortSearch());
      }).toThrow('useCohortSearch must be used within CohortSearchProvider');
    });

    it('should return null for currentSearch initially', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentSearch).toBeNull();
    });

    it('should return null for queryResults initially', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.queryResults).toBeNull();
    });
  });

  describe('initializeSearch', () => {
    it('should create a new search with name', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('My Cohort Search');
      });

      expect(result.current.currentSearch).not.toBeNull();
      expect(result.current.currentSearch?.name).toBe('My Cohort Search');
      expect(result.current.currentSearch?.criteria).toEqual([]);
      expect(result.current.currentSearch?.id).toMatch(/^search-/);
    });

    it('should clear previous results when initializing', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      expect(result.current.queryResults).toBeNull();
      expect(result.current.queryError).toBeNull();
    });
  });

  describe('addCriterion', () => {
    it('should add criterion to current search', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      const ageCriterion = createAgeCriterion(40, 65);

      act(() => {
        result.current.addCriterion(ageCriterion);
      });

      expect(result.current.currentSearch?.criteria).toHaveLength(1);
      expect(result.current.currentSearch?.criteria[0]).toEqual(ageCriterion);
    });

    it('should not add criterion if no search initialized', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      const ageCriterion = createAgeCriterion(40, 65);

      act(() => {
        result.current.addCriterion(ageCriterion);
      });

      expect(result.current.currentSearch).toBeNull();
    });

    it('should add multiple criteria', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      const ageCriterion = createAgeCriterion(40, 65);
      const genderCriterion = createGenderCriterion('female');

      act(() => {
        result.current.addCriterion(ageCriterion);
        result.current.addCriterion(genderCriterion);
      });

      expect(result.current.currentSearch?.criteria).toHaveLength(2);
    });
  });

  describe('updateCriterion', () => {
    it('should update criterion by id', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      const ageCriterion = createAgeCriterion(40, 65);

      act(() => {
        result.current.addCriterion(ageCriterion);
      });

      act(() => {
        result.current.updateCriterion(ageCriterion.id, { minAge: 50 });
      });

      expect(result.current.currentSearch?.criteria[0]).toMatchObject({
        id: ageCriterion.id,
        type: 'age',
        minAge: 50,
        maxAge: 65,
      });
    });
  });

  describe('removeCriterion', () => {
    it('should remove criterion by id', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      const ageCriterion = createAgeCriterion(40, 65);

      act(() => {
        result.current.addCriterion(ageCriterion);
      });

      act(() => {
        result.current.removeCriterion(ageCriterion.id);
      });

      expect(result.current.currentSearch?.criteria).toHaveLength(0);
    });
  });

  describe('getGeneratedQuery', () => {
    it('should return /Patient when no search initialized', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getGeneratedQuery()).toBe('/Patient');
    });

    it('should return /Patient when no criteria', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      expect(result.current.getGeneratedQuery()).toBe('/Patient');
    });

    it('should return query with criteria', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      const genderCriterion = createGenderCriterion('female');

      act(() => {
        result.current.addCriterion(genderCriterion);
      });

      expect(result.current.getGeneratedQuery()).toBe('/Patient?gender=female');
    });
  });

  describe('runQuery', () => {
    it('should execute query and store results', async () => {
      vi.useRealTimers();

      const mockPatients = [
        { resourceType: 'Patient' as const, id: '1' },
        { resourceType: 'Patient' as const, id: '2' },
      ];

      vi.mocked(executeQuery).mockResolvedValue({
        patients: mockPatients,
        total: 2,
        bundle: { resourceType: 'Bundle', type: 'searchset' },
      });

      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      await act(async () => {
        await result.current.runQuery();
      });

      expect(result.current.queryResults?.patients).toEqual(mockPatients);
      expect(result.current.queryResults?.total).toBe(2);
      expect(result.current.queryError).toBeNull();
    });

    it('should handle query errors', async () => {
      vi.useRealTimers();

      vi.mocked(executeQuery).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      await act(async () => {
        await result.current.runQuery();
      });

      expect(result.current.queryResults).toBeNull();
      expect(result.current.queryError).toBe('Network error');
    });

    it('should set isExecutingQuery while running', async () => {
      vi.useRealTimers();

      let resolveQuery: (value: unknown) => void;
      const queryPromise = new Promise((resolve) => {
        resolveQuery = resolve;
      });

      vi.mocked(executeQuery).mockReturnValue(queryPromise as never);

      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      act(() => {
        result.current.runQuery();
      });

      expect(result.current.isExecutingQuery).toBe(true);

      await act(async () => {
        resolveQuery!({
          patients: [],
          total: 0,
          bundle: { resourceType: 'Bundle', type: 'searchset' },
        });
      });

      await waitFor(() => {
        expect(result.current.isExecutingQuery).toBe(false);
      });
    });
  });

  describe('clearResults', () => {
    it('should clear query results and error', async () => {
      vi.useRealTimers();

      vi.mocked(executeQuery).mockResolvedValue({
        patients: [{ resourceType: 'Patient', id: '1' }],
        total: 1,
        bundle: { resourceType: 'Bundle', type: 'searchset' },
      });

      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      await act(async () => {
        await result.current.runQuery();
      });

      expect(result.current.queryResults).not.toBeNull();

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.queryResults).toBeNull();
      expect(result.current.queryError).toBeNull();
    });
  });

  describe('clearSearch', () => {
    it('should clear everything', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      expect(result.current.currentSearch).not.toBeNull();

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.currentSearch).toBeNull();
      expect(result.current.queryResults).toBeNull();
      expect(result.current.queryError).toBeNull();
    });
  });

  describe('patient selection', () => {
    const mockPatient1 = { resourceType: 'Patient' as const, id: 'patient-1' };
    const mockPatient2 = { resourceType: 'Patient' as const, id: 'patient-2' };

    it('should return empty map for selectedPatients initially', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.selectedPatients.size).toBe(0);
    });

    it('should toggle patient selection on', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.togglePatientSelection(mockPatient1);
      });

      expect(result.current.selectedPatients.size).toBe(1);
      expect(result.current.selectedPatients.get('patient-1')).toEqual(mockPatient1);
    });

    it('should toggle patient selection off', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.togglePatientSelection(mockPatient1);
      });

      expect(result.current.selectedPatients.size).toBe(1);

      act(() => {
        result.current.togglePatientSelection(mockPatient1);
      });

      expect(result.current.selectedPatients.size).toBe(0);
    });

    it('should check if patient is selected', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPatientSelected('patient-1')).toBe(false);

      act(() => {
        result.current.togglePatientSelection(mockPatient1);
      });

      expect(result.current.isPatientSelected('patient-1')).toBe(true);
      expect(result.current.isPatientSelected('patient-2')).toBe(false);
    });

    it('should select all patients from query results', async () => {
      vi.useRealTimers();

      const mockPatients = [mockPatient1, mockPatient2];

      vi.mocked(executeQuery).mockResolvedValue({
        patients: mockPatients,
        total: 2,
        bundle: { resourceType: 'Bundle', type: 'searchset' },
      });

      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.initializeSearch('Test Search');
      });

      await act(async () => {
        await result.current.runQuery();
      });

      act(() => {
        result.current.selectAllPatients();
      });

      expect(result.current.selectedPatients.size).toBe(2);
      expect(result.current.isPatientSelected('patient-1')).toBe(true);
      expect(result.current.isPatientSelected('patient-2')).toBe(true);
    });

    it('should clear all selected patients', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.togglePatientSelection(mockPatient1);
        result.current.togglePatientSelection(mockPatient2);
      });

      expect(result.current.selectedPatients.size).toBe(2);

      act(() => {
        result.current.clearSelectedPatients();
      });

      expect(result.current.selectedPatients.size).toBe(0);
    });

    it('should remove a specific selected patient', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.togglePatientSelection(mockPatient1);
        result.current.togglePatientSelection(mockPatient2);
      });

      expect(result.current.selectedPatients.size).toBe(2);

      act(() => {
        result.current.removeSelectedPatient('patient-1');
      });

      expect(result.current.selectedPatients.size).toBe(1);
      expect(result.current.isPatientSelected('patient-1')).toBe(false);
      expect(result.current.isPatientSelected('patient-2')).toBe(true);
    });

    it('should not toggle patient without id', () => {
      const { result } = renderHook(() => useCohortSearch(), {
        wrapper: createWrapper(),
      });

      const patientWithoutId = { resourceType: 'Patient' as const };

      act(() => {
        result.current.togglePatientSelection(patientWithoutId);
      });

      expect(result.current.selectedPatients.size).toBe(0);
    });
  });
});
