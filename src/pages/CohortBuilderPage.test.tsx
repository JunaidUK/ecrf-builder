import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CohortBuilderPage } from './CohortBuilderPage';
import { CohortSearchProvider } from '../context/CohortSearchContext';
import { resetCriterionCounter } from '../utils/cohort-criteria-factory';

vi.mock('../services/fhir-client', () => ({
  executeQuery: vi.fn(),
}));

import { executeQuery } from '../services/fhir-client';

function renderWithProviders(component: ReactNode) {
  return render(
    <BrowserRouter>
      <CohortSearchProvider>{component}</CohortSearchProvider>
    </BrowserRouter>
  );
}

describe('CohortBuilderPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 28));
    resetCriterionCounter();
    vi.clearAllMocks();
  });

  it('should render page header', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(screen.getByText('Cohort Search Builder')).toBeInTheDocument();
  });

  it('should render back button', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument();
  });

  it('should render criteria panel', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(screen.getByText('Criteria')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Conditions')).toBeInTheDocument();
    expect(screen.getByText('Observations')).toBeInTheDocument();
  });

  it('should render empty state initially', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(screen.getByText('No search criteria added yet')).toBeInTheDocument();
  });

  it('should render query preview panel', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(screen.getByText('Query Preview')).toBeInTheDocument();
  });

  it('should show /Patient query initially', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(screen.getByText('/Patient')).toBeInTheDocument();
  });

  it('should render Search Patients button', () => {
    renderWithProviders(<CohortBuilderPage />);

    expect(
      screen.getByRole('button', { name: 'Search Patients' })
    ).toBeInTheDocument();
  });

  describe('Adding criteria', () => {
    it('should add age criterion when Age button clicked', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Age' }));

      expect(screen.getByText('Age Range')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum age')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum age')).toBeInTheDocument();
    });

    it('should add gender criterion when Gender button clicked', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Gender' }));

      expect(screen.getByLabelText('Select gender')).toBeInTheDocument();
      expect(screen.getByText('gender')).toBeInTheDocument();
    });

    it('should add condition criterion when condition button clicked', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Hypertension' }));

      expect(screen.getByText('59621000')).toBeInTheDocument();
      expect(screen.getByText('condition')).toBeInTheDocument();
    });

    it('should add observation criterion when observation button clicked', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add BMI' }));

      expect(screen.getByText('39156-5')).toBeInTheDocument();
      expect(screen.getByText('observation')).toBeInTheDocument();
    });
  });

  describe('Updating criteria', () => {
    it('should update query when age criteria changes', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Age' }));

      const minInput = screen.getByLabelText('Minimum age');
      fireEvent.change(minInput, { target: { value: '40' } });

      expect(screen.getByText(/birthdate=le1986-01-28/)).toBeInTheDocument();
    });

    it('should update query when gender changes', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Gender' }));

      const select = screen.getByLabelText('Select gender');
      fireEvent.change(select, { target: { value: 'female' } });

      expect(screen.getByText(/gender=female/)).toBeInTheDocument();
    });
  });

  describe('Removing criteria', () => {
    it('should remove criterion when remove button clicked', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Age' }));

      expect(screen.getByText('Age Range')).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: /remove age range criterion/i })
      );

      expect(screen.queryByText('Age Range')).not.toBeInTheDocument();
      expect(screen.getByText('No search criteria added yet')).toBeInTheDocument();
    });
  });

  describe('Panel toggling', () => {
    it('should collapse criteria panel', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Collapse criteria panel' })
      );

      expect(screen.queryByText('Demographics')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Expand criteria panel' })
      ).toBeInTheDocument();
    });

    it('should collapse query preview panel', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Collapse query preview' })
      );

      expect(screen.queryByText('/Patient')).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Expand query preview' })
      ).toBeInTheDocument();
    });
  });

  describe('Query execution', () => {
    it('should execute query when Search Patients button clicked', async () => {
      vi.useRealTimers();

      vi.mocked(executeQuery).mockResolvedValue({
        patients: [
          {
            resourceType: 'Patient',
            id: 'test-123',
            name: [{ given: ['John'], family: 'Doe' }],
            gender: 'male',
            birthDate: '1990-01-15',
          },
        ],
        total: 1,
        bundle: { resourceType: 'Bundle', type: 'searchset' },
      });

      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Search Patients' }));

      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show loading state while searching', async () => {
      vi.useRealTimers();

      let resolveQuery: (value: unknown) => void;
      const queryPromise = new Promise((resolve) => {
        resolveQuery = resolve;
      });

      vi.mocked(executeQuery).mockReturnValue(queryPromise as never);

      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Search Patients' }));

      expect(screen.getByText('Searching...')).toBeInTheDocument();

      await waitFor(async () => {
        resolveQuery!({
          patients: [],
          total: 0,
          bundle: { resourceType: 'Bundle', type: 'searchset' },
        });
      });
    });

    it('should show error state on query failure', async () => {
      vi.useRealTimers();

      vi.mocked(executeQuery).mockRejectedValue(new Error('Connection refused'));

      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Search Patients' }));

      await waitFor(() => {
        expect(screen.getByText('Error executing query')).toBeInTheDocument();
      });

      expect(screen.getByText('Connection refused')).toBeInTheDocument();
    });

    it('should show empty results message when no patients found', async () => {
      vi.useRealTimers();

      vi.mocked(executeQuery).mockResolvedValue({
        patients: [],
        total: 0,
        bundle: { resourceType: 'Bundle', type: 'searchset' },
      });

      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Search Patients' }));

      await waitFor(() => {
        expect(
          screen.getByText('No patients match the search criteria')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Complex queries', () => {
    it('should build combined query with multiple criteria', () => {
      renderWithProviders(<CohortBuilderPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Age' }));
      const minInput = screen.getByLabelText('Minimum age');
      fireEvent.change(minInput, { target: { value: '40' } });

      fireEvent.click(screen.getByRole('button', { name: 'Add Gender' }));
      const genderSelect = screen.getByLabelText('Select gender');
      fireEvent.change(genderSelect, { target: { value: 'female' } });

      const query = screen.getByText(/\/Patient\?/);
      expect(query.textContent).toContain('birthdate=');
      expect(query.textContent).toContain('gender=female');
    });
  });
});
