import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObservationInput } from './ObservationInput';
import type { ObservationCriterion } from '../../../types/cohort.types';
import { LOINC_SYSTEM } from '../../../types/fhir-codes.types';

describe('ObservationInput', () => {
  const defaultCriterion: ObservationCriterion = {
    id: 'observation-1',
    type: 'observation',
    code: '39156-5',
    display: 'BMI',
    system: LOINC_SYSTEM,
    comparator: 'gt',
    value: 30,
    unit: 'kg/m2',
  };

  it('should render LOINC code', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByText('LOINC:')).toBeInTheDocument();
    expect(screen.getByText('39156-5')).toBeInTheDocument();
  });

  it('should render comparator select', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByLabelText('Select comparator')).toBeInTheDocument();
  });

  it('should render value input', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByLabelText('Observation value')).toBeInTheDocument();
  });

  it('should render unit when provided', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByText('kg/m2')).toBeInTheDocument();
  });

  it('should not render unit when not provided', () => {
    const onChange = vi.fn();
    const criterion: ObservationCriterion = {
      ...defaultCriterion,
      unit: undefined,
    };
    render(<ObservationInput criterion={criterion} onChange={onChange} />);

    expect(screen.queryByText('kg/m2')).not.toBeInTheDocument();
  });

  it('should display all comparator options', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByRole('option', { name: '=' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '>' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '<' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '>=' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '<=' })).toBeInTheDocument();
  });

  it('should display current comparator value', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select comparator') as HTMLSelectElement;
    expect(select.value).toBe('gt');
  });

  it('should display current value', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    const input = screen.getByLabelText('Observation value') as HTMLInputElement;
    expect(input.value).toBe('30');
  });

  it('should call onChange when comparator changes', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    const select = screen.getByLabelText('Select comparator');
    fireEvent.change(select, { target: { value: 'ge' } });

    expect(onChange).toHaveBeenCalledWith({ comparator: 'ge' });
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    const input = screen.getByLabelText('Observation value');
    fireEvent.change(input, { target: { value: '35' } });

    expect(onChange).toHaveBeenCalledWith({ value: 35 });
  });

  it('should handle decimal values', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    const input = screen.getByLabelText('Observation value');
    fireEvent.change(input, { target: { value: '30.5' } });

    expect(onChange).toHaveBeenCalledWith({ value: 30.5 });
  });

  it('should not call onChange for invalid number', () => {
    const onChange = vi.fn();
    render(<ObservationInput criterion={defaultCriterion} onChange={onChange} />);

    const input = screen.getByLabelText('Observation value');
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should display different LOINC codes', () => {
    const onChange = vi.fn();
    const criterion: ObservationCriterion = {
      ...defaultCriterion,
      code: '8480-6',
      display: 'Systolic BP',
      unit: 'mmHg',
    };
    render(<ObservationInput criterion={criterion} onChange={onChange} />);

    expect(screen.getByText('8480-6')).toBeInTheDocument();
    expect(screen.getByText('mmHg')).toBeInTheDocument();
  });
});
