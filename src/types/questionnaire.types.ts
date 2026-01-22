import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

// Re-export FHIR types for convenience
export type { Questionnaire, QuestionnaireItem };

// FHIR Questionnaire status values
export type QuestionnaireStatus = 'draft' | 'active' | 'retired' | 'unknown';

// Base URL for generating questionnaire canonical URLs
export const QUESTIONNAIRE_BASE_URL = 'http://ExampleOrganization.com';

// Form state for the create questionnaire modal
export interface QuestionnaireFormState {
  title: string;
  status: QuestionnaireStatus;
}

// Form validation errors
export interface QuestionnaireFormErrors {
  title?: string;
  status?: string;
}
