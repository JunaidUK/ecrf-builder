import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Patient } from 'fhir/r4';
import type { SearchCriterion, CohortSearchState } from '../types/cohort.types';
import { buildFhirQuery, buildQueryParams } from '../utils/fhir-query-builder';
import { executeQuery } from '../services/fhir-client';

interface QueryResults {
  patients: Patient[];
  total: number;
}

interface CohortSearchContextValue {
  currentSearch: CohortSearchState | null;
  queryResults: QueryResults | null;
  isExecutingQuery: boolean;
  queryError: string | null;
  initializeSearch: (name: string) => void;
  addCriterion: (criterion: SearchCriterion) => void;
  updateCriterion: (id: string, updates: Partial<SearchCriterion>) => void;
  removeCriterion: (id: string) => void;
  getGeneratedQuery: () => string;
  runQuery: () => Promise<void>;
  clearResults: () => void;
  clearSearch: () => void;
}

const CohortSearchContext = createContext<CohortSearchContextValue | null>(null);

interface CohortSearchProviderProps {
  children: ReactNode;
}

function generateSearchId(): string {
  return `search-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function CohortSearchProvider({
  children,
}: CohortSearchProviderProps): ReactNode {
  const [currentSearch, setCurrentSearch] = useState<CohortSearchState | null>(
    null
  );
  const [queryResults, setQueryResults] = useState<QueryResults | null>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const initializeSearch = useCallback((name: string): void => {
    const now = new Date().toISOString();
    setCurrentSearch({
      id: generateSearchId(),
      name,
      criteria: [],
      createdAt: now,
      updatedAt: now,
    });
    setQueryResults(null);
    setQueryError(null);
  }, []);

  const addCriterion = useCallback((criterion: SearchCriterion): void => {
    setCurrentSearch((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        criteria: [...prev.criteria, criterion],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const updateCriterion = useCallback(
    (id: string, updates: Partial<SearchCriterion>): void => {
      setCurrentSearch((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          criteria: prev.criteria.map((criterion) =>
            criterion.id === id
              ? ({ ...criterion, ...updates } as SearchCriterion)
              : criterion
          ),
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  const removeCriterion = useCallback((id: string): void => {
    setCurrentSearch((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        criteria: prev.criteria.filter((criterion) => criterion.id !== id),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const getGeneratedQuery = useCallback((): string => {
    if (!currentSearch) {
      return '/Patient';
    }
    return buildFhirQuery(currentSearch.criteria);
  }, [currentSearch]);

  const runQuery = useCallback(async (): Promise<void> => {
    setIsExecutingQuery(true);
    setQueryError(null);

    try {
      const query = currentSearch
        ? buildQueryParams(currentSearch.criteria)
        : '';
      const result = await executeQuery(`/Patient?${query}`);

      setQueryResults({
        patients: result.patients,
        total: result.total,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to execute query';
      setQueryError(message);
      setQueryResults(null);
    } finally {
      setIsExecutingQuery(false);
    }
  }, [currentSearch]);

  const clearResults = useCallback((): void => {
    setQueryResults(null);
    setQueryError(null);
  }, []);

  const clearSearch = useCallback((): void => {
    setCurrentSearch(null);
    setQueryResults(null);
    setQueryError(null);
  }, []);

  const value: CohortSearchContextValue = {
    currentSearch,
    queryResults,
    isExecutingQuery,
    queryError,
    initializeSearch,
    addCriterion,
    updateCriterion,
    removeCriterion,
    getGeneratedQuery,
    runQuery,
    clearResults,
    clearSearch,
  };

  return (
    <CohortSearchContext.Provider value={value}>
      {children}
    </CohortSearchContext.Provider>
  );
}

export function useCohortSearch(): CohortSearchContextValue {
  const context = useContext(CohortSearchContext);

  if (!context) {
    throw new Error('useCohortSearch must be used within CohortSearchProvider');
  }

  return context;
}
