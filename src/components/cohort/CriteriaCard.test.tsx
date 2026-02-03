import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CriteriaCard } from './CriteriaCard';
import type {
  AgeCriterion,
  GenderCriterion,
  ConditionCriterion,
  ObservationCriterion,
} from '../../types/cohort.types';
import { ICD10_SYSTEM, LOINC_SYSTEM } from '../../types/fhir-codes.types';

describe('CriteriaCard', () => {
  describe('Age criterion', () => {
    const ageCriterion: AgeCriterion = {
      id: 'age-1',
      type: 'age',
      minAge: 40,
      maxAge: 65,
    };

    it('should render age criterion card', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={ageCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('Age Range')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
    });

    it('should render age inputs', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={ageCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByLabelText('Minimum age')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum age')).toBeInTheDocument();
    });

    it('should call onUpdate when age changes', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={ageCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      const minInput = screen.getByLabelText('Minimum age');
      fireEvent.change(minInput, { target: { value: '50' } });

      expect(onUpdate).toHaveBeenCalledWith('age-1', { minAge: 50 });
    });
  });

  describe('Gender criterion', () => {
    const genderCriterion: GenderCriterion = {
      id: 'gender-1',
      type: 'gender',
      value: 'female',
    };

    it('should render gender criterion card', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={genderCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('Gender')).toBeInTheDocument();
      expect(screen.getByText('gender')).toBeInTheDocument();
    });

    it('should render gender select', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={genderCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByLabelText('Select gender')).toBeInTheDocument();
    });
  });

  describe('Condition criterion', () => {
    const conditionCriterion: ConditionCriterion = {
      id: 'condition-1',
      type: 'condition',
      code: 'I10',
      display: 'Hypertension',
      system: ICD10_SYSTEM,
    };

    it('should render condition criterion card', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={conditionCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText('condition')).toBeInTheDocument();
    });

    it('should render ICD-10 code', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={conditionCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('I10')).toBeInTheDocument();
    });
  });

  describe('Observation criterion', () => {
    const observationCriterion: ObservationCriterion = {
      id: 'observation-1',
      type: 'observation',
      code: '39156-5',
      display: 'BMI',
      system: LOINC_SYSTEM,
      comparator: 'gt',
      value: 30,
      unit: 'kg/m2',
    };

    it('should render observation criterion card', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={observationCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('BMI')).toBeInTheDocument();
      expect(screen.getByText('observation')).toBeInTheDocument();
    });

    it('should render LOINC code and unit', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={observationCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(screen.getByText('39156-5')).toBeInTheDocument();
      expect(screen.getByText('kg/m2')).toBeInTheDocument();
    });
  });

  describe('Remove button', () => {
    const ageCriterion: AgeCriterion = {
      id: 'age-1',
      type: 'age',
      minAge: 40,
      maxAge: 65,
    };

    it('should render remove button', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={ageCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      expect(
        screen.getByRole('button', { name: /remove age range criterion/i })
      ).toBeInTheDocument();
    });

    it('should call onRemove when remove button clicked', () => {
      const onUpdate = vi.fn();
      const onRemove = vi.fn();
      render(
        <CriteriaCard
          criterion={ageCriterion}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      );

      const removeButton = screen.getByRole('button', {
        name: /remove age range criterion/i,
      });
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith('age-1');
    });
  });
});
