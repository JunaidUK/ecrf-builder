import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectedCohortPanel } from './SelectedCohortPanel';
import type { Patient } from 'fhir/r4';

describe('SelectedCohortPanel', () => {
  const mockPatient1: Patient = {
    resourceType: 'Patient',
    id: 'patient-1-abcd-1234',
    name: [{ given: ['John'], family: 'Doe' }],
  };

  const mockPatient2: Patient = {
    resourceType: 'Patient',
    id: 'patient-2-efgh-5678',
    name: [{ given: ['Jane'], family: 'Smith' }],
  };

  const defaultProps = {
    selectedPatients: new Map<string, Patient>(),
    isCollapsed: false,
    onToggleCollapse: vi.fn(),
    onRemovePatient: vi.fn(),
    onClearAll: vi.fn(),
    onGenerateECRFs: vi.fn(),
    isExporting: false,
  };

  describe('Expanded state', () => {
    it('should render header with title', () => {
      render(<SelectedCohortPanel {...defaultProps} />);

      expect(screen.getByText('Selected Cohort')).toBeInTheDocument();
    });

    it('should show empty message when no patients selected', () => {
      render(<SelectedCohortPanel {...defaultProps} />);

      expect(
        screen.getByText(/No patients selected/)
      ).toBeInTheDocument();
    });

    it('should show patient count badge when patients selected', () => {
      const selectedPatients = new Map([
        ['patient-1-abcd-1234', mockPatient1],
        ['patient-2-efgh-5678', mockPatient2],
      ]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should list selected patients', () => {
      const selectedPatients = new Map([
        ['patient-1-abcd-1234', mockPatient1],
        ['patient-2-efgh-5678', mockPatient2],
      ]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should call onRemovePatient when remove button clicked', () => {
      const onRemovePatient = vi.fn();
      const selectedPatients = new Map([['patient-1-abcd-1234', mockPatient1]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
          onRemovePatient={onRemovePatient}
        />
      );

      const removeButton = screen.getByLabelText('Remove John Doe from cohort');
      fireEvent.click(removeButton);

      expect(onRemovePatient).toHaveBeenCalledWith('patient-1-abcd-1234');
    });

    it('should show action buttons when patients selected', () => {
      const selectedPatients = new Map([['patient-1-abcd-1234', mockPatient1]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
      expect(screen.getByText('Generate eCRFs')).toBeInTheDocument();
    });

    it('should call onClearAll when Clear All clicked', () => {
      const onClearAll = vi.fn();
      const selectedPatients = new Map([['patient-1-abcd-1234', mockPatient1]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
          onClearAll={onClearAll}
        />
      );

      fireEvent.click(screen.getByText('Clear All'));

      expect(onClearAll).toHaveBeenCalled();
    });

    it('should call onGenerateECRFs when Generate eCRFs clicked', () => {
      const onGenerateECRFs = vi.fn();
      const selectedPatients = new Map([['patient-1-abcd-1234', mockPatient1]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
          onGenerateECRFs={onGenerateECRFs}
        />
      );

      fireEvent.click(screen.getByText('Generate eCRFs'));

      expect(onGenerateECRFs).toHaveBeenCalled();
    });

    it('should call onToggleCollapse when collapse button clicked', () => {
      const onToggleCollapse = vi.fn();

      render(
        <SelectedCohortPanel
          {...defaultProps}
          onToggleCollapse={onToggleCollapse}
        />
      );

      const collapseButton = screen.getByLabelText('Collapse cohort panel');
      fireEvent.click(collapseButton);

      expect(onToggleCollapse).toHaveBeenCalled();
    });
  });

  describe('Collapsed state', () => {
    it('should show expand button when collapsed', () => {
      render(<SelectedCohortPanel {...defaultProps} isCollapsed={true} />);

      expect(screen.getByLabelText('Expand cohort panel')).toBeInTheDocument();
    });

    it('should show patient count when collapsed with patients', () => {
      const selectedPatients = new Map([
        ['patient-1-abcd-1234', mockPatient1],
        ['patient-2-efgh-5678', mockPatient2],
      ]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
          isCollapsed={true}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should call onToggleCollapse when expand button clicked', () => {
      const onToggleCollapse = vi.fn();

      render(
        <SelectedCohortPanel
          {...defaultProps}
          isCollapsed={true}
          onToggleCollapse={onToggleCollapse}
        />
      );

      fireEvent.click(screen.getByLabelText('Expand cohort panel'));

      expect(onToggleCollapse).toHaveBeenCalled();
    });
  });

  describe('Export state', () => {
    it('should show progress bar when exporting', () => {
      const selectedPatients = new Map([['patient-1-abcd-1234', mockPatient1]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
          isExporting={true}
          exportProgress={{ current: 3, total: 10 }}
        />
      );

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
    });

    it('should disable buttons when exporting', () => {
      const selectedPatients = new Map([['patient-1-abcd-1234', mockPatient1]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
          isExporting={true}
          exportProgress={{ current: 3, total: 10 }}
        />
      );

      expect(screen.getByText('Clear All')).toBeDisabled();
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle patient without name', () => {
      const patientWithoutName: Patient = {
        resourceType: 'Patient',
        id: 'no-name-patient',
      };
      const selectedPatients = new Map([['no-name-patient', patientWithoutName]]);

      render(
        <SelectedCohortPanel
          {...defaultProps}
          selectedPatients={selectedPatients}
        />
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });
});
