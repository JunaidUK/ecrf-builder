import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgeRangeInput } from './AgeRangeInput';
import type { AgeCriterion } from '../../../types/cohort.types';

describe('AgeRangeInput', () => {
  const defaultCriterion: AgeCriterion = {
    id: 'age-1',
    type: 'age',
    minAge: 40,
    maxAge: 65,
  };

  it('should render min and max inputs', () => {
    const onChange = vi.fn();
    render(<AgeRangeInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByLabelText('Minimum age')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum age')).toBeInTheDocument();
  });

  it('should display current values', () => {
    const onChange = vi.fn();
    render(<AgeRangeInput criterion={defaultCriterion} onChange={onChange} />);

    const minInput = screen.getByLabelText('Minimum age') as HTMLInputElement;
    const maxInput = screen.getByLabelText('Maximum age') as HTMLInputElement;

    expect(minInput.value).toBe('40');
    expect(maxInput.value).toBe('65');
  });

  it('should display empty string for undefined values', () => {
    const onChange = vi.fn();
    const criterion: AgeCriterion = {
      id: 'age-1',
      type: 'age',
    };
    render(<AgeRangeInput criterion={criterion} onChange={onChange} />);

    const minInput = screen.getByLabelText('Minimum age') as HTMLInputElement;
    const maxInput = screen.getByLabelText('Maximum age') as HTMLInputElement;

    expect(minInput.value).toBe('');
    expect(maxInput.value).toBe('');
  });

  it('should call onChange with minAge when min input changes', () => {
    const onChange = vi.fn();
    render(<AgeRangeInput criterion={defaultCriterion} onChange={onChange} />);

    const minInput = screen.getByLabelText('Minimum age');
    fireEvent.change(minInput, { target: { value: '50' } });

    expect(onChange).toHaveBeenCalledWith({ minAge: 50 });
  });

  it('should call onChange with maxAge when max input changes', () => {
    const onChange = vi.fn();
    render(<AgeRangeInput criterion={defaultCriterion} onChange={onChange} />);

    const maxInput = screen.getByLabelText('Maximum age');
    fireEvent.change(maxInput, { target: { value: '70' } });

    expect(onChange).toHaveBeenCalledWith({ maxAge: 70 });
  });

  it('should call onChange with undefined when input is cleared', () => {
    const onChange = vi.fn();
    render(<AgeRangeInput criterion={defaultCriterion} onChange={onChange} />);

    const minInput = screen.getByLabelText('Minimum age');
    fireEvent.change(minInput, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith({ minAge: undefined });
  });

  it('should have proper accessible labels', () => {
    const onChange = vi.fn();
    render(<AgeRangeInput criterion={defaultCriterion} onChange={onChange} />);

    expect(screen.getByText('Min:')).toBeInTheDocument();
    expect(screen.getByText('Max:')).toBeInTheDocument();
  });
});
