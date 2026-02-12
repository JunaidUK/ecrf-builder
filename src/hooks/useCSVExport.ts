import { useState, useCallback } from 'react';
import type { Patient } from 'fhir/r4';
import { exportCohortToCSV } from '../utils/csv-export';
import type { ExportProgress } from '../utils/csv-export';
import { getPatientDetails } from '../services/fhir-client';

interface UseCSVExportResult {
  isExporting: boolean;
  exportProgress: ExportProgress | undefined;
  exportError: string | null;
  exportCohort: (patients: Patient[]) => Promise<void>;
}

export function useCSVExport(): UseCSVExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | undefined>(undefined);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportCohort = useCallback(async (patients: Patient[]): Promise<void> => {
    if (patients.length === 0) {
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress({ current: 0, total: patients.length });

    try {
      await exportCohortToCSV(patients, getPatientDetails, setExportProgress);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export cohort';
      setExportError(message);
    } finally {
      setIsExporting(false);
      setExportProgress(undefined);
    }
  }, []);

  return {
    isExporting,
    exportProgress,
    exportError,
    exportCohort,
  };
}
