import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from './FormField';

describe('FormField', () => {
  it('should render label', () => {
    render(
      <FormField label="Email" name="email">
        <input type="email" />
      </FormField>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should associate label with input via htmlFor', () => {
    render(
      <FormField label="Email" name="email">
        <input type="email" />
      </FormField>
    );

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('should add id to child input', () => {
    render(
      <FormField label="Email" name="email">
        <input type="email" />
      </FormField>
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email');
  });

  it('should display error message when provided', () => {
    render(
      <FormField label="Email" name="email" error="Email is required">
        <input type="email" />
      </FormField>
    );

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should link error to input via aria-describedby', () => {
    render(
      <FormField label="Email" name="email" error="Email is required">
        <input type="email" />
      </FormField>
    );

    const input = screen.getByRole('textbox');
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBe('email-error');
    expect(screen.getByText('Email is required')).toHaveAttribute('id', errorId);
  });

  it('should set aria-invalid when error is present', () => {
    render(
      <FormField label="Email" name="email" error="Email is required">
        <input type="email" />
      </FormField>
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('should show required indicator when required', () => {
    render(
      <FormField label="Email" name="email" required>
        <input type="email" />
      </FormField>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should set aria-required on input when required', () => {
    render(
      <FormField label="Email" name="email" required>
        <input type="email" />
      </FormField>
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('should render select element correctly', () => {
    render(
      <FormField label="Status" name="status">
        <select>
          <option value="draft">Draft</option>
        </select>
      </FormField>
    );

    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'status');
  });

  it('should pass onChange to child element', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormField label="Email" name="email">
        <input type="email" onChange={handleChange} />
      </FormField>
    );

    await user.type(screen.getByRole('textbox'), 'test@example.com');

    expect(handleChange).toHaveBeenCalled();
  });
});
