import type {
  Bundle,
  Patient,
  Condition,
  MedicationRequest,
  Observation,
} from 'fhir/r4';

// In Docker, nginx proxies /fhir to the HAPI FHIR server
// For development, you can override this via VITE_FHIR_BASE_URL environment variable
const FHIR_BASE_URL = import.meta.env.VITE_FHIR_BASE_URL || '/fhir';

export interface FhirSearchResult {
  patients: Patient[];
  total: number;
  bundle: Bundle;
}

export interface FhirClientError {
  message: string;
  status?: number;
}

export async function searchPatients(
  queryParams: string
): Promise<FhirSearchResult> {
  const url = queryParams
    ? `${FHIR_BASE_URL}/Patient?${queryParams}&_count=100`
    : `${FHIR_BASE_URL}/Patient?_count=100`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/fhir+json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const error: FhirClientError = {
      message: `FHIR server error: ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  const bundle: Bundle = await response.json();

  const patients: Patient[] = (bundle.entry ?? [])
    .map((entry) => entry.resource as Patient)
    .filter((resource): resource is Patient =>
      resource?.resourceType === 'Patient'
    );

  return {
    patients,
    total: bundle.total ?? patients.length,
    bundle,
  };
}

export async function executeQuery(query: string): Promise<FhirSearchResult> {
  // Extract query params from the full query path
  // Query format: /Patient or /Patient?param1=value1&param2=value2
  const queryParams = query.includes('?')
    ? query.split('?')[1]
    : '';

  return searchPatients(queryParams);
}

export interface PatientDetails {
  patient: Patient;
  conditions: Condition[];
  medications: MedicationRequest[];
  observations: Observation[];
}

async function fetchBundle(url: string): Promise<Bundle> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/fhir+json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`FHIR server error: ${response.statusText}`);
  }

  return response.json();
}

export async function getPatientConditions(
  patientId: string
): Promise<Condition[]> {
  const url = `${FHIR_BASE_URL}/Condition?patient=${patientId}&_count=100`;
  const bundle = await fetchBundle(url);

  return (bundle.entry ?? [])
    .map((entry) => entry.resource as Condition)
    .filter((resource): resource is Condition =>
      resource?.resourceType === 'Condition'
    );
}

export async function getPatientMedications(
  patientId: string
): Promise<MedicationRequest[]> {
  const url = `${FHIR_BASE_URL}/MedicationRequest?patient=${patientId}&_count=100`;
  const bundle = await fetchBundle(url);

  return (bundle.entry ?? [])
    .map((entry) => entry.resource as MedicationRequest)
    .filter((resource): resource is MedicationRequest =>
      resource?.resourceType === 'MedicationRequest'
    );
}

export async function getPatientObservations(
  patientId: string
): Promise<Observation[]> {
  const url = `${FHIR_BASE_URL}/Observation?patient=${patientId}&_count=200`;
  const bundle = await fetchBundle(url);

  return (bundle.entry ?? [])
    .map((entry) => entry.resource as Observation)
    .filter((resource): resource is Observation =>
      resource?.resourceType === 'Observation'
    );
}

export async function getPatientDetails(
  patient: Patient
): Promise<PatientDetails> {
  const patientId = patient.id;

  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  const [conditions, medications, observations] = await Promise.all([
    getPatientConditions(patientId),
    getPatientMedications(patientId),
    getPatientObservations(patientId),
  ]);

  return {
    patient,
    conditions,
    medications,
    observations,
  };
}
