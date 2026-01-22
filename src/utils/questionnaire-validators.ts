import type {
  QuestionnaireFormState,
  QuestionnaireFormErrors,
  QuestionnaireStatus,
} from '../types/questionnaire.types';

const VALID_STATUSES: QuestionnaireStatus[] = ['draft', 'active', 'retired', 'unknown'];

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();

  if (!trimmed) {
    return 'Title is required';
  }

  if (trimmed.length < 3) {
    return 'Title must be at least 3 characters';
  }

  return null;
}

export function validateStatus(status: string): string | null {
  if (!status) {
    return 'Status is required';
  }

  if (!VALID_STATUSES.includes(status as QuestionnaireStatus)) {
    return 'Status must be draft, active, retired, or unknown';
  }

  return null;
}

export function validateQuestionnaireForm(
  form: QuestionnaireFormState
): QuestionnaireFormErrors {
  const errors: QuestionnaireFormErrors = {};

  const titleError = validateTitle(form.title);
  if (titleError) {
    errors.title = titleError;
  }

  const statusError = validateStatus(form.status);
  if (statusError) {
    errors.status = statusError;
  }

  return errors;
}
