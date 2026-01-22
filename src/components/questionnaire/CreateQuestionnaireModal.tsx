import { useState, useEffect, useMemo } from 'react';
import type { ReactNode, FormEvent, ChangeEvent } from 'react';
import type { Questionnaire } from 'fhir/r4';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField } from '../common/FormField';
import { validateQuestionnaireForm } from '../../utils/questionnaire-validators';
import { slugify } from '../../utils/slugify';
import {
  QUESTIONNAIRE_BASE_URL,
  type QuestionnaireFormState,
  type QuestionnaireFormErrors,
  type QuestionnaireStatus,
} from '../../types/questionnaire.types';

interface CreateQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (questionnaire: Questionnaire) => void;
}

const initialFormState: QuestionnaireFormState = {
  title: '',
  status: '' as QuestionnaireStatus,
};

export function CreateQuestionnaireModal({
  isOpen,
  onClose,
  onCreate,
}: CreateQuestionnaireModalProps): ReactNode {
  const [formState, setFormState] = useState<QuestionnaireFormState>(initialFormState);
  const [errors, setErrors] = useState<QuestionnaireFormErrors>({});

  const derivedId = useMemo(() => slugify(formState.title), [formState.title]);
  const derivedUrl = useMemo(
    () => (derivedId ? `${QUESTIONNAIRE_BASE_URL}/${derivedId}` : ''),
    [derivedId]
  );

  useEffect(() => {
    if (!isOpen) {
      setFormState(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormState((prev) => ({ ...prev, title: event.target.value }));
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setFormState((prev) => ({
      ...prev,
      status: event.target.value as QuestionnaireStatus,
    }));
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const validationErrors = validateQuestionnaireForm(formState);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: derivedId,
      title: formState.title,
      url: derivedUrl,
      status: formState.status,
    };

    onCreate(questionnaire);
  };

  const inputStyles =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  const readonlyInputStyles =
    'w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new eCRF">
      <form onSubmit={handleSubmit}>
        <FormField label="Title" name="title" required error={errors.title}>
          <input
            type="text"
            value={formState.title}
            onChange={handleTitleChange}
            className={inputStyles}
            placeholder="e.g., Type 2 Diabetes"
          />
        </FormField>

        <FormField label="ID" name="derivedId">
          <input
            type="text"
            value={derivedId}
            readOnly
            className={readonlyInputStyles}
            placeholder="Generated from title"
          />
        </FormField>

        <FormField label="URL" name="derivedUrl">
          <input
            type="text"
            value={derivedUrl}
            readOnly
            className={readonlyInputStyles}
            placeholder="Generated from ID"
          />
        </FormField>

        <FormField label="Status" name="status" required error={errors.status}>
          <select
            value={formState.status}
            onChange={handleStatusChange}
            className={inputStyles}
          >
            <option value="">Select status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
            <option value="unknown">Unknown</option>
          </select>
        </FormField>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </Modal>
  );
}
