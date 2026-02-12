import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Patient,
  Condition,
  MedicationRequest,
  Observation,
  Resource,
} from 'fhir/r4';
import { Modal } from '../common/Modal';
import { getPatientDetails } from '../../services/fhir-client';
import type { PatientDetails } from '../../services/fhir-client';

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onViewResource?: (resource: Resource) => void;
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

function calculateAge(birthDate: string | undefined): number | null {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function formatGender(gender: string | undefined): string {
  if (!gender) {
    return 'Unknown';
  }
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function getConditionDisplay(condition: Condition): string {
  const coding = condition.code?.coding?.[0];
  return coding?.display ?? condition.code?.text ?? 'Unknown condition';
}

function getConditionStatus(condition: Condition): string {
  const status = condition.clinicalStatus?.coding?.[0]?.code;
  return status ?? 'unknown';
}

function getMedicationDisplay(medication: MedicationRequest): string {
  const medicationCodeableConcept = medication.medicationCodeableConcept;
  const coding = medicationCodeableConcept?.coding?.[0];
  return coding?.display ?? medicationCodeableConcept?.text ?? 'Unknown medication';
}

function getMedicationStatus(medication: MedicationRequest): string {
  return medication.status ?? 'unknown';
}

function getObservationDisplay(observation: Observation): string {
  const coding = observation.code?.coding?.[0];
  return coding?.display ?? observation.code?.text ?? 'Unknown observation';
}

function getObservationValue(observation: Observation): string {
  if (observation.valueQuantity) {
    const value = observation.valueQuantity.value;
    const unit = observation.valueQuantity.unit ?? '';
    return value !== undefined ? `${value} ${unit}`.trim() : 'No value';
  }
  if (observation.valueString) {
    return observation.valueString;
  }
  if (observation.valueCodeableConcept) {
    return observation.valueCodeableConcept.coding?.[0]?.display ??
           observation.valueCodeableConcept.text ?? 'No value';
  }
  if (observation.valueBoolean !== undefined) {
    return observation.valueBoolean ? 'Yes' : 'No';
  }
  return 'No value';
}

function getObservationDate(observation: Observation): string {
  const dateTime = observation.effectiveDateTime;
  if (!dateTime) return '';

  try {
    const date = new Date(dateTime);
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

function sortObservationsByDate(observations: Observation[]): Observation[] {
  return [...observations].sort((a, b) => {
    const dateA = a.effectiveDateTime ?? '';
    const dateB = b.effectiveDateTime ?? '';
    return dateB.localeCompare(dateA);
  });
}

const CONDITION_STATUS_PRIORITY: Record<string, number> = {
  active: 0,
  recurrence: 1,
  relapse: 2,
  inactive: 3,
  remission: 4,
  resolved: 5,
  unknown: 6,
};

const MEDICATION_STATUS_PRIORITY: Record<string, number> = {
  active: 0,
  'on-hold': 1,
  draft: 2,
  completed: 3,
  stopped: 4,
  cancelled: 5,
  'entered-in-error': 6,
  unknown: 7,
};

function sortConditionsByStatus(conditions: Condition[]): Condition[] {
  return [...conditions].sort((a, b) => {
    const statusA = getConditionStatus(a);
    const statusB = getConditionStatus(b);
    const priorityA = CONDITION_STATUS_PRIORITY[statusA] ?? CONDITION_STATUS_PRIORITY.unknown;
    const priorityB = CONDITION_STATUS_PRIORITY[statusB] ?? CONDITION_STATUS_PRIORITY.unknown;
    return priorityA - priorityB;
  });
}

function sortMedicationsByStatus(medications: MedicationRequest[]): MedicationRequest[] {
  return [...medications].sort((a, b) => {
    const statusA = getMedicationStatus(a);
    const statusB = getMedicationStatus(b);
    const priorityA = MEDICATION_STATUS_PRIORITY[statusA] ?? MEDICATION_STATUS_PRIORITY.unknown;
    const priorityB = MEDICATION_STATUS_PRIORITY[statusB] ?? MEDICATION_STATUS_PRIORITY.unknown;
    return priorityA - priorityB;
  });
}

interface VitalSigns {
  height: number | null;
  weight: number | null;
  bmi: number | null;
}

const VITAL_SIGN_CODES = {
  height: ['8302-2', '8306-3'],
  weight: ['29463-7', '3141-9'],
  bmi: ['39156-5'],
};

function extractVitalSigns(observations: Observation[]): VitalSigns {
  const vitals: VitalSigns = {
    height: null,
    weight: null,
    bmi: null,
  };

  const sortedObs = [...observations].sort((a, b) => {
    const dateA = a.effectiveDateTime ?? '';
    const dateB = b.effectiveDateTime ?? '';
    return dateB.localeCompare(dateA);
  });

  for (const obs of sortedObs) {
    const code = obs.code?.coding?.[0]?.code;
    if (!code) continue;

    const value = obs.valueQuantity?.value;
    if (value === undefined) continue;

    if (vitals.height === null && VITAL_SIGN_CODES.height.includes(code)) {
      vitals.height = value;
    }
    if (vitals.weight === null && VITAL_SIGN_CODES.weight.includes(code)) {
      vitals.weight = value;
    }
    if (vitals.bmi === null && VITAL_SIGN_CODES.bmi.includes(code)) {
      vitals.bmi = value;
    }
  }

  return vitals;
}

interface InfoRowProps {
  label: string;
  value: string | number | null;
  unit?: string;
}

function InfoRow({ label, value, unit }: InfoRowProps): ReactNode {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">
        {value ?? 'Unknown'}
        {value !== null && unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps): ReactNode {
  const colorClasses: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    resolved: 'bg-blue-100 text-blue-800',
    completed: 'bg-blue-100 text-blue-800',
    stopped: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-600',
  };

  const className = colorClasses[status] ?? colorClasses.unknown;

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>
      {status}
    </span>
  );
}

export function PatientDetailModal({
  patient,
  isOpen,
  onClose,
  onViewResource,
}: PatientDetailModalProps): ReactNode {
  const [details, setDetails] = useState<PatientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !patient) {
      setDetails(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    getPatientDetails(patient)
      .then((result) => {
        setDetails(result);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load patient details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, patient]);

  if (!patient) {
    return null;
  }

  const age = calculateAge(patient.birthDate);
  const vitals = details ? extractVitalSigns(details.observations) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getPatientName(patient)}
      size="lg"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading patient details...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Patient Information
              </h3>
              {onViewResource && (
                <button
                  onClick={() => onViewResource(patient)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View FHIR
                </button>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <InfoRow label="Age" value={age} unit="years" />
              <InfoRow label="Gender" value={formatGender(patient.gender)} />
              <InfoRow label="Birth Date" value={patient.birthDate ?? null} />
              <InfoRow label="Patient ID" value={patient.id ?? null} />
            </div>
          </section>

          {vitals && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Vital Signs
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <InfoRow label="Height" value={vitals.height} unit="cm" />
                <InfoRow label="Weight" value={vitals.weight} unit="kg" />
                <InfoRow label="BMI" value={vitals.bmi ? Math.round(vitals.bmi * 10) / 10 : null} unit="kg/m²" />
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Conditions ({details?.conditions.length ?? 0})
            </h3>
            {details && details.conditions.length > 0 ? (
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
                {sortConditionsByStatus(details.conditions).map((condition, index) => (
                  <div
                    key={condition.id ?? index}
                    className={`px-4 py-2 flex items-center justify-between ${onViewResource ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => onViewResource?.(condition)}
                    role={onViewResource ? 'button' : undefined}
                    tabIndex={onViewResource ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onViewResource && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onViewResource(condition);
                      }
                    }}
                  >
                    <span className="text-sm text-gray-900">{getConditionDisplay(condition)}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={getConditionStatus(condition)} />
                      {onViewResource && (
                        <span className="text-xs text-gray-400">{'›'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No conditions recorded</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Medications ({details?.medications.length ?? 0})
            </h3>
            {details && details.medications.length > 0 ? (
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
                {sortMedicationsByStatus(details.medications).map((medication, index) => (
                  <div
                    key={medication.id ?? index}
                    className={`px-4 py-2 flex items-center justify-between ${onViewResource ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => onViewResource?.(medication)}
                    role={onViewResource ? 'button' : undefined}
                    tabIndex={onViewResource ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onViewResource && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onViewResource(medication);
                      }
                    }}
                  >
                    <span className="text-sm text-gray-900">{getMedicationDisplay(medication)}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={getMedicationStatus(medication)} />
                      {onViewResource && (
                        <span className="text-xs text-gray-400">{'›'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No medications recorded</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Observations ({details?.observations.length ?? 0})
            </h3>
            {details && details.observations.length > 0 ? (
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
                {sortObservationsByDate(details.observations).map((observation, index) => (
                  <div
                    key={observation.id ?? index}
                    className={`px-4 py-2 flex items-center justify-between ${onViewResource ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => onViewResource?.(observation)}
                    role={onViewResource ? 'button' : undefined}
                    tabIndex={onViewResource ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onViewResource && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onViewResource(observation);
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{getObservationDisplay(observation)}</span>
                      <span className="text-xs text-gray-500">{getObservationDate(observation)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{getObservationValue(observation)}</span>
                      {onViewResource && (
                        <span className="text-xs text-gray-400">{'›'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No observations recorded</p>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
