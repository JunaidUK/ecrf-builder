import type { Patient, Condition, MedicationRequest } from 'fhir/r4';
import type { CohortExportData } from '../types/cohort.types';
import type { PatientDetails } from '../services/fhir-client';

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

function getActiveConditions(conditions: Condition[]): Condition[] {
  return conditions.filter((condition) => {
    const status = condition.clinicalStatus?.coding?.[0]?.code;
    return status === 'active' || status === 'recurrence' || status === 'relapse';
  });
}

function getActiveMedications(medications: MedicationRequest[]): MedicationRequest[] {
  return medications.filter((medication) => {
    return medication.status === 'active';
  });
}

function getConditionDisplay(condition: Condition): string {
  const coding = condition.code?.coding?.[0];
  return coding?.display ?? condition.code?.text ?? 'Unknown';
}

function getConditionCode(condition: Condition): string {
  const coding = condition.code?.coding?.[0];
  if (!coding) {
    return '';
  }
  return coding.code ?? '';
}

function getMedicationDisplay(medication: MedicationRequest): string {
  const medicationCodeableConcept = medication.medicationCodeableConcept;
  const coding = medicationCodeableConcept?.coding?.[0];
  return coding?.display ?? medicationCodeableConcept?.text ?? 'Unknown';
}

function getMedicationCode(medication: MedicationRequest): string {
  const coding = medication.medicationCodeableConcept?.coding?.[0];
  if (!coding) {
    return '';
  }
  return coding.code ?? '';
}

export function formatPatientForExport(details: PatientDetails): CohortExportData {
  const { patient, conditions, medications } = details;

  const activeConditions = getActiveConditions(conditions);
  const activeMedications = getActiveMedications(medications);

  return {
    patientId: patient.id ?? '',
    patientName: getPatientName(patient),
    gender: formatGender(patient.gender),
    birthDate: patient.birthDate ?? '',
    age: calculateAge(patient.birthDate),
    conditions: activeConditions.map(getConditionDisplay).join('; '),
    conditionCodes: activeConditions.map(getConditionCode).filter(Boolean).join('; '),
    medications: activeMedications.map(getMedicationDisplay).join('; '),
    medicationCodes: activeMedications.map(getMedicationCode).filter(Boolean).join('; '),
  };
}

function escapeCSVField(field: string | number | null): string {
  if (field === null) {
    return '';
  }

  const stringValue = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function generateCSVContent(data: CohortExportData[]): string {
  const headers = [
    'Patient ID',
    'Patient Name',
    'Gender',
    'Birth Date',
    'Age',
    'Active Conditions',
    'Condition Codes',
    'Active Medications',
    'Medication Codes',
  ];

  const headerRow = headers.map(escapeCSVField).join(',');

  const dataRows = data.map((row) => {
    return [
      row.patientId,
      row.patientName,
      row.gender,
      row.birthDate,
      row.age,
      row.conditions,
      row.conditionCodes,
      row.medications,
      row.medicationCodes,
    ]
      .map(escapeCSVField)
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export interface ExportProgress {
  current: number;
  total: number;
}

export async function exportCohortToCSV(
  patients: Patient[],
  getPatientDetails: (patient: Patient) => Promise<PatientDetails>,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const total = patients.length;
  const exportData: CohortExportData[] = [];

  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const details = await getPatientDetails(patient);
    exportData.push(formatPatientForExport(details));

    onProgress?.({ current: i + 1, total });
  }

  const csvContent = generateCSVContent(exportData);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `cohort-export-${timestamp}.csv`;

  downloadCSV(csvContent, filename);
}
