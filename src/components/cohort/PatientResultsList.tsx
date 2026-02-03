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
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        <p className="text-gray-500 mt-4">Searching patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error executing query</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No patients match the search criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Search Results
          <span className="ml-2 text-gray-500 font-normal">
            ({total} patient{total !== 1 ? 's' : ''} found
            {patients.length < total ? `, showing ${patients.length}` : ''})
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birth Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className={`hover:bg-gray-50 ${onPatientClick ? 'cursor-pointer' : ''}`}
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
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getPatientName(patient)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatGender(patient.gender)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {patient.birthDate ?? 'Unknown'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {getPatientAge(patient.birthDate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                  {patient.id?.slice(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
