import type { ReactNode } from 'react';
import type { Patient } from 'fhir/r4';

interface PatientResultsListProps {
  patients: Patient[];
  total: number;
  isLoading: boolean;
  error: string | null;
  onPatientClick?: (patient: Patient) => void;
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
}: PatientResultsListProps): ReactNode {
  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e8e8e8] via-[#ffffff] to-[#d4d4d4] rounded-xl opacity-75 blur-sm"></div>
        <div className="relative bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] rounded-xl border border-white/50 p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="animate-pulse">
            <div className="h-4 bg-gradient-to-r from-[#e0e0e0] to-[#d0d0d0] rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gradient-to-r from-[#e8e8e8] to-[#e0e0e0] rounded-lg"></div>
              <div className="h-12 bg-gradient-to-r from-[#e8e8e8] to-[#e0e0e0] rounded-lg"></div>
              <div className="h-12 bg-gradient-to-r from-[#e8e8e8] to-[#e0e0e0] rounded-lg"></div>
            </div>
          </div>
          <p className="text-[#888] mt-4">Searching patients...</p>
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e8e8e8] via-[#ffffff] to-[#d4d4d4] rounded-xl opacity-75 blur-sm"></div>
        <div className="relative bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] rounded-xl border border-white/50 p-8 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <p className="text-[#888]">No patients match the search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e8e8e8] via-[#ffffff] to-[#d4d4d4] rounded-xl opacity-75 blur-sm"></div>
      <div className="relative bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] rounded-xl border border-white/50 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 bg-gradient-to-b from-[#f5f5f5] to-[#efefef] border-b border-[#e0e0e0]">
          <h3 className="text-sm font-semibold bg-gradient-to-b from-[#333] to-[#666] bg-clip-text text-transparent">
            Search Results
            <span className="ml-2 text-[#888] font-normal">
              ({total} patient{total !== 1 ? 's' : ''} found
              {patients.length < total ? `, showing ${patients.length}` : ''})
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e8e8e8]">
            <thead className="bg-gradient-to-b from-[#f8f8f8] to-[#f0f0f0]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Birth Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-[#e8e8e8]">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className={`hover:bg-gradient-to-r hover:from-[#f8f8f8] hover:to-[#f0f0f0] transition-all duration-200 ${onPatientClick ? 'cursor-pointer' : ''}`}
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
                  <td className="px-4 py-3 text-sm text-[#333]">
                    {getPatientName(patient)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666]">
                    {formatGender(patient.gender)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666]">
                    {patient.birthDate ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666]">
                    {getPatientAge(patient.birthDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#999] font-mono">
                    {patient.id?.slice(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
