import type { ReactNode } from 'react';
import type { Patient } from 'fhir/r4';

interface PatientResultsListProps {
  patients: Patient[];
  total: number;
  isLoading: boolean;
  error: string | null;
  onPatientClick?: (patient: Patient) => void;
  selectedPatientIds?: Set<string>;
  onToggleSelection?: (patient: Patient) => void;
  onSelectAll?: () => void;
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

function getPatientAge(birthDate: string | undefined): string {
  if (!birthDate) {
    return 'Unknown';
  }

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${age} years`;
}

function formatGender(gender: string | undefined): string {
  if (!gender) {
    return 'Unknown';
  }
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export function PatientResultsList({
  patients,
  total,
  isLoading,
  error,
  onPatientClick,
  selectedPatientIds,
  onToggleSelection,
  onSelectAll,
}: PatientResultsListProps): ReactNode {
  const hasSelection = selectedPatientIds !== undefined && onToggleSelection !== undefined;
  const allSelected = hasSelection &&
    patients.length > 0 &&
    patients.every((p) => p.id && selectedPatientIds.has(p.id));
  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--chrome-bg-accent)] via-[#ffffff] to-[var(--chrome-border-glow)] rounded-xl opacity-75 blur-sm"></div>
        <div className="relative bg-gradient-to-br from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)] rounded-xl border border-white/50 p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="animate-pulse">
            <div className="h-4 bg-gradient-to-r from-[var(--chrome-bg-inset)] to-[var(--chrome-border-divider)] rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gradient-to-r from-[var(--chrome-bg-accent)] to-[var(--chrome-bg-inset)] rounded-lg"></div>
              <div className="h-12 bg-gradient-to-r from-[var(--chrome-bg-accent)] to-[var(--chrome-bg-inset)] rounded-lg"></div>
              <div className="h-12 bg-gradient-to-r from-[var(--chrome-bg-accent)] to-[var(--chrome-bg-inset)] rounded-lg"></div>
            </div>
          </div>
          <p className="text-[var(--chrome-text-tertiary)] mt-4">Searching patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-200 via-red-100 to-red-200 rounded-xl opacity-75 blur-sm"></div>
        <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200/50 p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <p className="text-red-600 font-medium">Error executing query</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--chrome-bg-accent)] via-[#ffffff] to-[var(--chrome-border-glow)] rounded-xl opacity-75 blur-sm"></div>
        <div className="relative bg-gradient-to-br from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)] rounded-xl border border-white/50 p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <p className="text-[var(--chrome-text-tertiary)]">No patients match the search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--chrome-bg-accent)] via-[#ffffff] to-[var(--chrome-border-glow)] rounded-xl opacity-75 blur-sm"></div>
      <div className="relative bg-gradient-to-br from-[var(--chrome-bg-surface)] to-[var(--chrome-bg-hover)] rounded-xl border border-white/50 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 bg-gradient-to-b from-[var(--chrome-bg-hover)] to-[var(--chrome-bg-panel-end)] border-b border-[var(--chrome-border-default)]">
          <h3 className="text-sm font-semibold bg-gradient-to-b from-[var(--chrome-text-heading)] to-[var(--chrome-text-secondary)] bg-clip-text text-transparent">
            Search Results
            <span className="ml-2 text-[var(--chrome-text-tertiary)] font-normal">
              ({total} patient{total !== 1 ? 's' : ''} found
              {patients.length < total ? `, showing ${patients.length}` : ''})
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--chrome-border-light)]">
            <thead className="bg-gradient-to-b from-[var(--chrome-bg-elevated)] to-[var(--chrome-bg-muted)]">
              <tr>
                {hasSelection && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => onSelectAll?.()}
                      className="w-4 h-4 rounded border-[var(--chrome-border-default)] text-[var(--chrome-text-heading)] focus:ring-2 focus:ring-offset-0 focus:ring-[var(--chrome-border-glow)] cursor-pointer"
                      aria-label="Select all patients"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
                  Birth Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-[var(--chrome-border-light)]">
              {patients.map((patient) => {
                const isSelected = hasSelection && patient.id && selectedPatientIds.has(patient.id);
                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-gradient-to-r hover:from-[var(--chrome-bg-elevated)] hover:to-[var(--chrome-bg-muted)] transition-all duration-200 ${onPatientClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-[var(--chrome-bg-accent)]' : ''}`}
                    onClick={() => onPatientClick?.(patient)}
                    role={onPatientClick ? 'button' : undefined}
                    tabIndex={onPatientClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onPatientClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onPatientClick(patient);
                      }
                    }}
                  >
                    {hasSelection && (
                      <td className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={isSelected === true}
                          onChange={() => onToggleSelection(patient)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-[var(--chrome-border-default)] text-[var(--chrome-text-heading)] focus:ring-2 focus:ring-offset-0 focus:ring-[var(--chrome-border-glow)] cursor-pointer"
                          aria-label={`Select ${getPatientName(patient)}`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-[var(--chrome-text-heading)]">
                      {getPatientName(patient)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--chrome-text-secondary)]">
                      {formatGender(patient.gender)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--chrome-text-secondary)]">
                      {patient.birthDate ?? 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--chrome-text-secondary)]">
                      {getPatientAge(patient.birthDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--chrome-text-disabled)] font-mono">
                      {patient.id?.slice(0, 8)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
