import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConditionInput } from './ConditionInput';
import type { ConditionCriterion } from '../../../types/cohort.types';
import { SNOMED_SYSTEM } from '../../../types/fhir-codes.types';

describe('ConditionInput', () => {
  const defaultCriterion: ConditionCriterion = {
    id: 'condition-1',
    type: 'condition',
    code: '59621000',
    display: 'Hypertension',
    system: SNOMED_SYSTEM,
  };

  it('should render SNOMED code', () => {
    const onChange = vi.fn();
    render(<ConditionInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByText('SNOMED:')).toBeInTheDocument();
    expect(screen.getByText('59621000')).toBeInTheDocument();
  });

  it('should render clinical status select', () => {
    const onChange = vi.fn();
    render(<ConditionInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByLabelText('Select clinical status')).toBeInTheDocument();
  });

  it('should display all status options', () => {
    const onChange = vi.fn();
    render(<ConditionInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByRole('option', { name: 'Any status' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Inactive' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Resolved' })).toBeInTheDocument();
  });

  it('should display current clinical status', () => {
    const onChange = vi.fn();
    const criterion: ConditionCriterion = {
      ...defaultCriterion,
      clinicalStatus: 'active',
    };
    render(<ConditionInput criterion={criterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select clinical status') as HTMLSelectElement;
    expect(select.value).toBe('active');
  });

  it('should display empty value for undefined clinical status', () => {
    const onChange = vi.fn();
    render(<ConditionInput criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select clinical status') as HTMLSelectElement;
    expect(select.value).toBe('');
  });

  it('should call onChange when status changes', () => {
    const onChange = vi.fn();
    render(<ConditionInput criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select clinical status');
    fireEvent.change(select, { target: { value: 'active' } });

    expect(onChange).toHaveBeenCalledWith({ clinicalStatus: 'active' });
  });

  it('should call onChange with undefined when Any status selected', () => {
    const onChange = vi.fn();
    const criterion: ConditionCriterion = {
      ...defaultCriterion,
      clinicalStatus: 'active',
    };
    render(<ConditionInput criterion={criterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select clinical status');
    fireEvent.change(select, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith({ clinicalStatus: undefined });
  });

  it('should display different SNOMED codes', () => {
    const onChange = vi.fn();
    const criterion: ConditionCriterion = {
      ...defaultCriterion,
      code: '44054006',
      display: 'Diabetes',
    };
    render(<ConditionInput criterion={criterion} onChange={onChange} />);

    expect(screen.getByText('44054006')).toBeInTheDocument();
  });
});
