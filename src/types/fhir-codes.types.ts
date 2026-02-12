export const ICD10_SYSTEM = 'http://hl7.org/fhir/sid/icd-10-cm';
export const SNOMED_SYSTEM = 'http://snomed.info/sct';
export const LOINC_SYSTEM = 'http://loinc.org';

export interface PredefinedCondition {
  code: string;
  display: string;
  system: string;
}

export interface PredefinedObservation {
  code: string;
  display: string;
  system: string;
  unit: string;
}

export const PREDEFINED_CONDITIONS: Record<string, PredefinedCondition> = {
  hypertension: {
    code: '59621000',
    display: 'Hypertension',
    system: SNOMED_SYSTEM,
  },
  diabetes: {
    code: '44054006',
    display: 'Diabetes',
    system: SNOMED_SYSTEM,
  },
  stroke: {
    code: '230690007',
    display: 'Stroke',
    system: SNOMED_SYSTEM,
  },
  mi: {
    code: '22298006',
    display: 'Myocardial Infarction',
    system: SNOMED_SYSTEM,
  },
  heartFailure: {
    code: '84114007',
    display: 'Heart failure',
    system: SNOMED_SYSTEM,
  },
  cad: {
    code: '53741008',
    display: 'Coronary Heart Disease',
    system: SNOMED_SYSTEM,
  },
  pad: {
    code: '840580004',
    display: 'Peripheral arterial disease',
    system: SNOMED_SYSTEM,
  },
};

export const PREDEFINED_OBSERVATIONS: Record<string, PredefinedObservation> = {
  bmi: {
    code: '39156-5',
    display: 'BMI',
    system: LOINC_SYSTEM,
    unit: 'kg/m2',
  },
  systolicBp: {
    code: '8480-6',
    display: 'Systolic BP',
    system: LOINC_SYSTEM,
    unit: 'mmHg',
  },
  diastolicBp: {
    code: '8462-4',
    display: 'Diastolic BP',
    system: LOINC_SYSTEM,
    unit: 'mmHg',
  },
  egfr: {
    code: '33914-3',
    display: 'eGFR',
    system: LOINC_SYSTEM,
    unit: 'mL/min/1.73m2',
  },
  cholesterol: {
    code: '2093-3',
    display: 'Total cholesterol',
    system: LOINC_SYSTEM,
    unit: 'mg/dL',
  },
};
