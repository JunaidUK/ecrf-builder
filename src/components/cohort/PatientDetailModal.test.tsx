import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PatientDetailModal } from './PatientDetailModal';
import type { Patient } from 'fhir/r4';

vi.mock('../../services/fhir-client', () => ({
  getPatientDetails: vi.fn(),
}));

import { getPatientDetails } from '../../services/fhir-client';

describe('PatientDetailModal', () => {
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'test-123',
    name: [{ given: ['John'], family: 'Doe' }],
    gender: 'male',
    birthDate: '1990-05-15',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when patient is null', () => {
    render(
      <PatientDetailModal
        patient={null}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render patient name in modal title', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [],
      medications: [],
      observations: [],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should show loading state while fetching details', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(getPatientDetails).mockReturnValue(promise as never);

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Loading patient details...')).toBeInTheDocument();

    resolvePromise!({
      patient: mockPatient,
      conditions: [],
      medications: [],
      observations: [],
    });
  });

  it('should display patient information', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [],
      medications: [],
      observations: [],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Patient Information')).toBeInTheDocument();
    });

    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('1990-05-15')).toBeInTheDocument();
  });

  it('should display conditions list', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [
        {
          resourceType: 'Condition',
          id: 'condition-1',
          code: {
            coding: [{ code: '59621000', display: 'Hypertension' }],
          },
          clinicalStatus: {
            coding: [{ code: 'active' }],
          },
          subject: { reference: 'Patient/test-123' },
        },
      ],
      medications: [],
      observations: [],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
    });

    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should display medications list', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [],
      medications: [
        {
          resourceType: 'MedicationRequest',
          id: 'med-1',
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: {
            coding: [{ display: 'Lisinopril 10 MG' }],
          },
          subject: { reference: 'Patient/test-123' },
        },
      ],
      observations: [],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lisinopril 10 MG')).toBeInTheDocument();
    });
  });

  it('should display vital signs from observations', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [],
      medications: [],
      observations: [
        {
          resourceType: 'Observation',
          id: 'obs-1',
          status: 'final',
          code: {
            coding: [{ code: '39156-5', display: 'BMI' }],
          },
          valueQuantity: { value: 24.5, unit: 'kg/m2' },
        },
      ],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Vital Signs')).toBeInTheDocument();
    });

    expect(screen.getByText('24.5 kg/m²')).toBeInTheDocument();
  });

  it('should show error message on fetch failure', async () => {
    vi.mocked(getPatientDetails).mockRejectedValue(new Error('Network error'));

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display no conditions message when empty', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [],
      medications: [],
      observations: [],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No conditions recorded')).toBeInTheDocument();
    });
  });

  it('should display no medications message when empty', async () => {
    vi.mocked(getPatientDetails).mockResolvedValue({
      patient: mockPatient,
      conditions: [],
      medications: [],
      observations: [],
    });

    render(
      <PatientDetailModal
        patient={mockPatient}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No medications recorded')).toBeInTheDocument();
    });
  });
});
