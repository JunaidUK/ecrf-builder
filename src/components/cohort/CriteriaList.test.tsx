import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CriteriaList } from './CriteriaList';
import type {
  AgeCriterion,
  GenderCriterion,
  SearchCriterion,
} from '../../types/cohort.types';

describe('CriteriaList', () => {
  const ageCriterion: AgeCriterion = {
    id: 'age-1',
    type: 'age',
    minAge: 40,
    maxAge: 65,
  };

  const genderCriterion: GenderCriterion = {
    id: 'gender-1',
    type: 'gender',
    value: 'female',
  };

  it('should render empty state when no criteria', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    render(
      <CriteriaList
        criteria={[]}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    expect(screen.getByText('No search criteria added yet')).toBeInTheDocument();
    expect(
      screen.getByText(/add criteria from the panel/i)
    ).toBeInTheDocument();
  });

  it('should render header when criteria exist', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    render(
      <CriteriaList
        criteria={[ageCriterion]}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    expect(screen.getByText('Search Criteria')).toBeInTheDocument();
  });

  it('should render single criterion', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    render(
      <CriteriaList
        criteria={[ageCriterion]}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    expect(screen.getByText('Age Range')).toBeInTheDocument();
  });

  it('should render multiple criteria', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const criteria: SearchCriterion[] = [ageCriterion, genderCriterion];
    render(
      <CriteriaList
        criteria={criteria}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    expect(screen.getByText('Age Range')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
  });

  it('should call onUpdateCriterion when criterion is updated', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    render(
      <CriteriaList
        criteria={[ageCriterion]}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    const minInput = screen.getByLabelText('Minimum age');
    fireEvent.change(minInput, { target: { value: '50' } });

    expect(onUpdate).toHaveBeenCalledWith('age-1', { minAge: 50 });
  });

  it('should call onRemoveCriterion when criterion is removed', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    render(
      <CriteriaList
        criteria={[ageCriterion]}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    const removeButton = screen.getByRole('button', {
      name: /remove age range criterion/i,
    });
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('age-1');
  });

  it('should render criteria in order', () => {
    const onUpdate = vi.fn();
    const onRemove = vi.fn();
    const criteria: SearchCriterion[] = [ageCriterion, genderCriterion];
    render(
      <CriteriaList
        criteria={criteria}
        onUpdateCriterion={onUpdate}
        onRemoveCriterion={onRemove}
      />
    );

    const cards = screen.getAllByRole('button', { name: /remove/i });
    expect(cards).toHaveLength(2);
  });
});
