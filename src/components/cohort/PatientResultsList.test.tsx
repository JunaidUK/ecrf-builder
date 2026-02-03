import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PatientResultsList } from './PatientResultsList';
import type { Patient } from 'fhir/r4';

describe('PatientResultsList', () => {
  const mockPatients: Patient[] = [
    {
      resourceType: 'Patient',
      id: '12345678-abcd-1234-efgh-123456789012',
      name: [{ given: ['John'], family: 'Doe' }],
      gender: 'male',
      birthDate: '1990-05-15',
    },
    {
      resourceType: 'Patient',
      id: '87654321-dcba-4321-hgfe-210987654321',
      name: [{ given: ['Jane', 'Marie'], family: 'Smith' }],
      gender: 'female',
      birthDate: '1985-10-20',
    },
  ];

  describe('Loading state', () => {
    it('should show loading indicator', () => {
      render(
        <PatientResultsList
          patients={[]}
          total={0}
          isLoading={true}
          error={null}
        />
      );

      expect(screen.getByText('Searching patients...')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error message', () => {
      render(
        <PatientResultsList
          patients={[]}
          total={0}
          isLoading={false}
          error="Connection refused"
        />
      );

      expect(screen.getByText('Error executing query')).toBeInTheDocument();
      expect(screen.getByText('Connection refused')).toBeInTheDocument();
    });
  });

  describe('Empty results', () => {
    it('should show no results message', () => {
      render(
        <PatientResultsList
          patients={[]}
          total={0}
          isLoading={false}
          error={null}
        />
      );

      expect(
        screen.getByText('No patients match the search criteria')
      ).toBeInTheDocument();
    });
  });

  describe('Results display', () => {
    it('should show results header with count', () => {
      render(
        <PatientResultsList
          patients={mockPatients}
          total={2}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText(/2 patients found/)).toBeInTheDocument();
    });

    it('should show patient names', () => {
      render(
        <PatientResultsList
          patients={mockPatients}
          total={2}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Marie Smith')).toBeInTheDocument();
    });

    it('should show patient genders', () => {
      render(
        <PatientResultsList
          patients={mockPatients}
          total={2}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
    });

    it('should show patient birth dates', () => {
      render(
        <PatientResultsList
          patients={mockPatients}
          total={2}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('1990-05-15')).toBeInTheDocument();
      expect(screen.getByText('1985-10-20')).toBeInTheDocument();
    });

    it('should show truncated patient IDs', () => {
      render(
        <PatientResultsList
          patients={mockPatients}
          total={2}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('12345678...')).toBeInTheDocument();
      expect(screen.getByText('87654321...')).toBeInTheDocument();
    });

    it('should show partial results message when total exceeds shown', () => {
      render(
        <PatientResultsList
          patients={mockPatients}
          total={100}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText(/showing 2/)).toBeInTheDocument();
    });
  });

  describe('Missing data handling', () => {
    it('should handle patient without name', () => {
      const patientWithoutName: Patient = {
        resourceType: 'Patient',
        id: 'test-id-12345678',
      };

      render(
        <PatientResultsList
          patients={[patientWithoutName]}
          total={1}
          isLoading={false}
          error={null}
        />
      );

      // Multiple "Unknown" values appear (name, gender, birthDate, age)
      const unknowns = screen.getAllByText('Unknown');
      expect(unknowns.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle patient without birth date', () => {
      const patientWithoutBirthDate: Patient = {
        resourceType: 'Patient',
        id: 'test-id-12345678',
        name: [{ given: ['Test'], family: 'Patient' }],
      };

      render(
        <PatientResultsList
          patients={[patientWithoutBirthDate]}
          total={1}
          isLoading={false}
          error={null}
        />
      );

      // Should show Unknown for both birth date and age
      const unknowns = screen.getAllByText('Unknown');
      expect(unknowns.length).toBeGreaterThanOrEqual(2);
    });
  });
});
