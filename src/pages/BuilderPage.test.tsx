import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { BuilderPage } from './BuilderPage';
import { QuestionnaireProvider, useQuestionnaire } from '../context/QuestionnaireContext';
import type { Questionnaire } from 'fhir/r4';

const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-id-123',
  url: 'http://example.com/questionnaire/test',
  status: 'draft',
};

function TestWrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <QuestionnaireProvider>
      <MemoryRouter initialEntries={['/builder/test-id-123']}>
        <Routes>
          <Route path="/builder/:id" element={children} />
        </Routes>
      </MemoryRouter>
    </QuestionnaireProvider>
  );
}

describe('BuilderPage', () => {
  it('should display questionnaire not found when id does not exist', () => {
    render(
      <TestWrapper>
        <BuilderPage />
      </TestWrapper>
    );

    expect(screen.getByText('Questionnaire not found')).toBeInTheDocument();
  });

  it('should display questionnaire URL when found', async () => {
    let addQuestionnaireFn: ((q: Questionnaire) => void) | null = null;

    function CaptureContext(): null {
      const { addQuestionnaire } = useQuestionnaire();
      addQuestionnaireFn = addQuestionnaire;
      return null;
    }

    render(
      <QuestionnaireProvider>
        <CaptureContext />
        <MemoryRouter initialEntries={['/builder/test-id-123']}>
          <Routes>
            <Route path="/builder/:id" element={<BuilderPage />} />
          </Routes>
        </MemoryRouter>
      </QuestionnaireProvider>
    );

    act(() => {
      addQuestionnaireFn?.(mockQuestionnaire);
    });

    expect(
      await screen.findByText('http://example.com/questionnaire/test')
    ).toBeInTheDocument();
  });

  it('should display questionnaire status when found', async () => {
    let addQuestionnaireFn: ((q: Questionnaire) => void) | null = null;

    function CaptureContext(): null {
      const { addQuestionnaire } = useQuestionnaire();
      addQuestionnaireFn = addQuestionnaire;
      return null;
    }

    render(
      <QuestionnaireProvider>
        <CaptureContext />
        <MemoryRouter initialEntries={['/builder/test-id-123']}>
          <Routes>
            <Route path="/builder/:id" element={<BuilderPage />} />
          </Routes>
        </MemoryRouter>
      </QuestionnaireProvider>
    );

    act(() => {
      addQuestionnaireFn?.(mockQuestionnaire);
    });

    expect(await screen.findByText('draft')).toBeInTheDocument();
  });

  it('should display builder heading when questionnaire found', async () => {
    let addQuestionnaireFn: ((q: Questionnaire) => void) | null = null;

    function CaptureContext(): null {
      const { addQuestionnaire } = useQuestionnaire();
      addQuestionnaireFn = addQuestionnaire;
      return null;
    }

    render(
      <QuestionnaireProvider>
        <CaptureContext />
        <MemoryRouter initialEntries={['/builder/test-id-123']}>
          <Routes>
            <Route path="/builder/:id" element={<BuilderPage />} />
          </Routes>
        </MemoryRouter>
      </QuestionnaireProvider>
    );

    act(() => {
      addQuestionnaireFn?.(mockQuestionnaire);
    });

    expect(
      await screen.findByRole('heading', { name: 'Questionnaire Builder' })
    ).toBeInTheDocument();
  });

  it('should have a link back to demo page', () => {
    render(
      <TestWrapper>
        <BuilderPage />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/demo'
    );
  });
});
