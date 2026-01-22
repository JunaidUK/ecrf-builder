import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Questionnaire } from 'fhir/r4';
import { CreateQuestionnaireModal } from './CreateQuestionnaireModal';
import { QUESTIONNAIRE_BASE_URL } from '../../types/questionnaire.types';

describe('CreateQuestionnaireModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCreate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with form fields', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    expect(screen.getByText('Create new eCRF')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
  });

  it('should have title field as required', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    const titleInput = screen.getByLabelText(/Title/);
    expect(titleInput).toHaveAttribute('aria-required', 'true');
  });

  it('should have Status field as required', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    const statusSelect = screen.getByLabelText(/Status/);
    expect(statusSelect).toHaveAttribute('aria-required', 'true');
  });

  it('should have ID field as readonly', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    const idInput = screen.getByLabelText(/ID/);
    expect(idInput).toHaveAttribute('readonly');
  });

  it('should have URL field as readonly', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    const urlInput = screen.getByLabelText(/URL/);
    expect(urlInput).toHaveAttribute('readonly');
  });

  it('should generate ID from title in real-time', async () => {
    const user = userEvent.setup();
    render(<CreateQuestionnaireModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Title/), 'Type 2 Diabetes');

    expect(screen.getByLabelText(/ID/)).toHaveValue('type-2-diabetes');
  });

  it('should generate URL from ID in real-time', async () => {
    const user = userEvent.setup();
    render(<CreateQuestionnaireModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Title/), 'Type 2 Diabetes');

    expect(screen.getByLabelText(/URL/)).toHaveValue(
      `${QUESTIONNAIRE_BASE_URL}/type-2-diabetes`
    );
  });

  it('should show empty ID and URL when title is empty', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    expect(screen.getByLabelText(/ID/)).toHaveValue('');
    expect(screen.getByLabelText(/URL/)).toHaveValue('');
  });

  it('should show validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<CreateQuestionnaireModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('should show error for title less than 3 characters', async () => {
    const user = userEvent.setup();
    render(<CreateQuestionnaireModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Title/), 'ab');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Title must be at least 3 characters')).toBeInTheDocument();
  });

  it('should call onCreate with valid form data', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateQuestionnaireModal {...defaultProps} onCreate={onCreate} />);

    await user.type(screen.getByLabelText(/Title/), 'Type 2 Diabetes');
    await user.selectOptions(screen.getByLabelText(/Status/), 'draft');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledOnce();
    });

    const createdQuestionnaire: Questionnaire = onCreate.mock.calls[0][0];
    expect(createdQuestionnaire.resourceType).toBe('Questionnaire');
    expect(createdQuestionnaire.title).toBe('Type 2 Diabetes');
    expect(createdQuestionnaire.id).toBe('type-2-diabetes');
    expect(createdQuestionnaire.url).toBe(`${QUESTIONNAIRE_BASE_URL}/type-2-diabetes`);
    expect(createdQuestionnaire.status).toBe('draft');
    expect(createdQuestionnaire.id).toBeDefined();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CreateQuestionnaireModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should reset form when modal is closed and reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CreateQuestionnaireModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/Title/), 'Test Form');

    rerender(<CreateQuestionnaireModal {...defaultProps} isOpen={false} />);
    rerender(<CreateQuestionnaireModal {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText(/Title/)).toHaveValue('');
    expect(screen.getByLabelText(/ID/)).toHaveValue('');
    expect(screen.getByLabelText(/URL/)).toHaveValue('');
  });

  it('should have all status options available', () => {
    render(<CreateQuestionnaireModal {...defaultProps} />);

    const statusSelect = screen.getByLabelText(/Status/);
    expect(statusSelect).toHaveTextContent('Select status');
    expect(statusSelect).toHaveTextContent('Draft');
    expect(statusSelect).toHaveTextContent('Active');
    expect(statusSelect).toHaveTextContent('Retired');
    expect(statusSelect).toHaveTextContent('Unknown');
  });
});
