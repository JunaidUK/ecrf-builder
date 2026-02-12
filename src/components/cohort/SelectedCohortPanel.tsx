import type { ReactNode } from 'react';
import type { Patient } from 'fhir/r4';

interface SelectedCohortPanelProps {
  selectedPatients: Map<string, Patient>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRemovePatient: (patientId: string) => void;
  onClearAll: () => void;
  onGenerateECRFs: () => void;
  isExporting: boolean;
  exportProgress?: { current: number; total: number };
}

function getPatientName(patient: Patient): string {
  const name = patient.name?.[0];
  if (!name) {
    return 'Unknown';
  }

  const given = name.given?.join(' ') ?? '';
  const family = name.family ?? '';

  return `${given} ${family}`.trim() || 'Unknown';
}

export function SelectedCohortPanel({
  selectedPatients,
  isCollapsed,
  onToggleCollapse,
  onRemovePatient,
  onClearAll,
  onGenerateECRFs,
  isExporting,
  exportProgress,
}: SelectedCohortPanelProps): ReactNode {
  const patientCount = selectedPatients.size;
  const patients = Array.from(selectedPatients.values());

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gradient-to-b from-white to-[var(--chrome-bg-elevated)] border-l border-[var(--chrome-border-default)] flex flex-col shadow-[-2px_0_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={onToggleCollapse}
          className="p-3 text-[var(--chrome-text-tertiary)] hover:text-[var(--chrome-text-body)] hover:bg-gradient-to-b hover:from-[var(--chrome-bg-hover)] hover:to-[var(--chrome-bg-accent)] transition-all duration-200"
          aria-label="Expand cohort panel"
        >
          <span className="block">◀</span>
          {patientCount > 0 && (
            <span className="mt-2 block text-xs font-semibold text-[var(--chrome-text-heading)]">
              {patientCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gradient-to-b from-white to-[var(--chrome-bg-surface)] border-l border-[var(--chrome-border-default)] flex flex-col shadow-[-2px_0_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--chrome-border-light)] bg-gradient-to-b from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent uppercase tracking-wider">
            Selected Cohort
          </h2>
          {patientCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-b from-[var(--chrome-bg-muted)] to-[var(--chrome-bg-inset)] rounded-full text-[var(--chrome-text-heading)] border border-white/60">
              {patientCount}
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-[var(--chrome-text-tertiary)] hover:text-[var(--chrome-text-body)] hover:bg-gradient-to-b hover:from-[var(--chrome-bg-muted)] hover:to-[var(--chrome-bg-inset)] rounded-lg transition-all duration-200"
          aria-label="Collapse cohort panel"
        >
          ▶
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {patientCount === 0 ? (
          <div className="p-4 text-center text-sm text-[var(--chrome-text-tertiary)]">
            No patients selected. Use the checkboxes in the search results to add patients to your cohort.
          </div>
        ) : (
          <div className="divide-y divide-[var(--chrome-border-light)]">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between px-4 py-2 hover:bg-gradient-to-r hover:from-[var(--chrome-bg-elevated)] hover:to-[var(--chrome-bg-muted)] transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--chrome-text-heading)] truncate">
                    {getPatientName(patient)}
                  </p>
                  <p className="text-xs text-[var(--chrome-text-disabled)] font-mono truncate">
                    {patient.id?.slice(0, 12)}...
                  </p>
                </div>
                <button
                  onClick={() => patient.id && onRemovePatient(patient.id)}
                  className="ml-2 p-1 text-[var(--chrome-text-disabled)] hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                  aria-label={`Remove ${getPatientName(patient)} from cohort`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {patientCount > 0 && (
        <div className="p-4 border-t border-[var(--chrome-border-light)] bg-gradient-to-b from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)] space-y-3">
          {isExporting && exportProgress && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-[var(--chrome-text-secondary)] mb-1">
                <span>Exporting...</span>
                <span>
                  {exportProgress.current} / {exportProgress.total}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--chrome-bg-inset)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--chrome-btn-dark-from)] to-[var(--chrome-btn-dark-to)] transition-all duration-300"
                  style={{
                    width: `${(exportProgress.current / exportProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={onClearAll}
            disabled={isExporting}
            className="w-full px-4 py-2 text-sm font-medium text-[var(--chrome-text-body)] bg-gradient-to-b from-[var(--chrome-bg-elevated)] to-[var(--chrome-bg-accent)] border border-white/60 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>

          <button
            onClick={onGenerateECRFs}
            disabled={isExporting}
            className="group relative w-full px-4 py-2.5 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--chrome-btn-dark-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-dark-to)] rounded-lg"></div>
            <div className="absolute inset-[1px] bg-gradient-to-b from-[var(--chrome-btn-inner-from)] via-[var(--chrome-btn-dark-via)] to-[var(--chrome-btn-inner-to)] rounded-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative text-white drop-shadow-sm text-sm">
              {isExporting ? 'Generating...' : 'Generate eCRFs'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
