import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GenderSelect } from './GenderSelect';
import type { GenderCriterion } from '../../../types/cohort.types';

describe('GenderSelect', () => {
  const defaultCriterion: GenderCriterion = {
    id: 'gender-1',
    type: 'gender',
    value: 'any',
  };

  it('should render select with label', () => {
    const onChange = vi.fn();
    render(<GenderSelect criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByText('Gender:')).toBeInTheDocument();
    expect(screen.getByLabelText('Select gender')).toBeInTheDocument();
  });

  it('should display all gender options', () => {
    const onChange = vi.fn();
    render(<GenderSelect criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select gender');
    expect(select).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'Any' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Female' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Unknown' })).toBeInTheDocument();
  });

  it('should display current value', () => {
    const onChange = vi.fn();
    const criterion: GenderCriterion = {
      ...defaultCriterion,
      value: 'female',
    };
    render(<GenderSelect criterion={criterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select gender') as HTMLSelectElement;
    expect(select.value).toBe('female');
  });

  it('should call onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<GenderSelect criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select gender');
    fireEvent.change(select, { target: { value: 'male' } });

    expect(onChange).toHaveBeenCalledWith({ value: 'male' });
  });

  it('should call onChange with female when selected', () => {
    const onChange = vi.fn();
    render(<GenderSelect criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select gender');
    fireEvent.change(select, { target: { value: 'female' } });

    expect(onChange).toHaveBeenCalledWith({ value: 'female' });
  });

  it('should call onChange with any when selected', () => {
    const onChange = vi.fn();
    const criterion: GenderCriterion = {
      ...defaultCriterion,
      value: 'male',
    };
    render(<GenderSelect criterion={criterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select gender');
    fireEvent.change(select, { target: { value: 'any' } });

    expect(onChange).toHaveBeenCalledWith({ value: 'any' });
  });
});
