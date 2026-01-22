import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  QuestionnaireProvider,
  useQuestionnaire,
} from './QuestionnaireContext';
import type { Questionnaire } from 'fhir/r4';

function createWrapper(): ({ children }: { children: ReactNode }) => ReactNode {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QuestionnaireProvider>{children}</QuestionnaireProvider>;
  };
}

const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-id-1',
  url: 'http://example.com/questionnaire/1',
  status: 'draft',
};

describe('QuestionnaireContext', () => {
  it('should provide initial empty state', () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createWrapper(),
    });

    expect(result.current.questionnaires).toEqual([]);
    expect(result.current.currentQuestionnaire).toBeNull();
  });

  it('should add a questionnaire', () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addQuestionnaire(mockQuestionnaire);
    });

    expect(result.current.questionnaires).toHaveLength(1);
    expect(result.current.questionnaires[0]).toEqual(mockQuestionnaire);
  });

  it('should set current questionnaire by id', () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addQuestionnaire(mockQuestionnaire);
    });

    act(() => {
      result.current.setCurrentQuestionnaire('test-id-1');
    });

    expect(result.current.currentQuestionnaire).toEqual(mockQuestionnaire);
  });

  it('should set currentQuestionnaire to null for non-existent id', () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addQuestionnaire(mockQuestionnaire);
    });

    act(() => {
      result.current.setCurrentQuestionnaire('non-existent-id');
    });

    expect(result.current.currentQuestionnaire).toBeNull();
  });

  it('should update an existing questionnaire', () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addQuestionnaire(mockQuestionnaire);
    });

    const updatedQuestionnaire: Questionnaire = {
      ...mockQuestionnaire,
      status: 'active',
    };

    act(() => {
      result.current.updateQuestionnaire(updatedQuestionnaire);
    });

    expect(result.current.questionnaires[0].status).toBe('active');
  });

  it('should update currentQuestionnaire when it is updated', () => {
    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addQuestionnaire(mockQuestionnaire);
      result.current.setCurrentQuestionnaire('test-id-1');
    });

    const updatedQuestionnaire: Questionnaire = {
      ...mockQuestionnaire,
      status: 'active',
    };

    act(() => {
      result.current.updateQuestionnaire(updatedQuestionnaire);
    });

    expect(result.current.currentQuestionnaire?.status).toBe('active');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useQuestionnaire());
    }).toThrow('useQuestionnaire must be used within QuestionnaireProvider');
  });
});
