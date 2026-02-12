import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FhirResourcePanel } from './FhirResourcePanel';
import type { Patient } from 'fhir/r4';

describe('FhirResourcePanel', () => {
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'test-123',
    name: [{ given: ['John'], family: 'Doe' }],
    gender: 'male',
    birthDate: '1990-05-15',
  };

  const mockOnClose = vi.fn();

  it('should not render when resource is null', () => {
    render(<FhirResourcePanel resource={null} onClose={mockOnClose} />);

    expect(screen.queryByText('FHIR')).not.toBeInTheDocument();
  });

  it('should render resource type and id', () => {
    render(<FhirResourcePanel resource={mockPatient} onClose={mockOnClose} />);

    expect(screen.getByText('FHIR')).toBeInTheDocument();
    expect(screen.getByText('Patient/test-123')).toBeInTheDocument();
  });

  it('should display JSON content when expanded', () => {
    render(<FhirResourcePanel resource={mockPatient} onClose={mockOnClose} />);

    expect(screen.getByText(/"resourceType": "Patient"/)).toBeInTheDocument();
    expect(screen.getByText(/"id": "test-123"/)).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<FhirResourcePanel resource={mockPatient} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close developer panel' }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should collapse when header is clicked', () => {
    render(<FhirResourcePanel resource={mockPatient} onClose={mockOnClose} />);

    expect(screen.getByText(/"resourceType": "Patient"/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Patient/test-123'));

    expect(screen.queryByText(/"resourceType": "Patient"/)).not.toBeInTheDocument();
  });

  it('should have copy button', () => {
    render(<FhirResourcePanel resource={mockPatient} onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: 'Copy JSON to clipboard' })).toBeInTheDocument();
  });

  it('should copy JSON to clipboard when copy button clicked', async () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<FhirResourcePanel resource={mockPatient} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Copy JSON to clipboard' }));

    expect(writeTextMock).toHaveBeenCalledWith(
      JSON.stringify(mockPatient, null, 2)
    );
  });
});
