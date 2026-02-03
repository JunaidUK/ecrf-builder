import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CriteriaPanel } from './CriteriaPanel';
import { resetCriterionCounter } from '../../utils/cohort-criteria-factory';

vi.mock('../../services/terminology-client', () => ({
  searchConditionsWithICD10: vi.fn().mockResolvedValue([]),
}));

describe('CriteriaPanel', () => {
  beforeEach(() => {
    resetCriterionCounter();
  });

  describe('Expanded state', () => {
    it('should render panel header', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      expect(screen.getByText('Criteria')).toBeInTheDocument();
    });

    it('should render demographics section', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      expect(screen.getByText('Demographics')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Age' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Gender' })).toBeInTheDocument();
    });

    it('should render conditions section with search and quick add', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      expect(screen.getByText('Conditions')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search conditions...')).toBeInTheDocument();
      expect(screen.getByText('Quick Add')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Hypertension' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Diabetes' })).toBeInTheDocument();
    });

    it('should render observations section', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      expect(screen.getByText('Observations')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add BMI' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Systolic BP' })).toBeInTheDocument();
    });

    it('should collapse panel when collapse button clicked', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      const collapseButton = screen.getByRole('button', {
        name: 'Collapse criteria panel',
      });
      fireEvent.click(collapseButton);

      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('Collapsed state', () => {
    it('should render expand button when collapsed', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={true}
          onToggleCollapse={onToggle}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Expand criteria panel' })
      ).toBeInTheDocument();
    });

    it('should not show criteria when collapsed', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={true}
          onToggleCollapse={onToggle}
        />
      );

      expect(screen.queryByText('Criteria')).not.toBeInTheDocument();
      expect(screen.queryByText('Demographics')).not.toBeInTheDocument();
    });

    it('should call onToggleCollapse when expand button clicked', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={true}
          onToggleCollapse={onToggle}
        />
      );

      const expandButton = screen.getByRole('button', {
        name: 'Expand criteria panel',
      });
      fireEvent.click(expandButton);

      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('Adding criteria', () => {
    it('should call onAddCriterion with age criterion', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Age' }));

      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'age',
          id: expect.stringContaining('age-'),
        })
      );
    });

    it('should call onAddCriterion with gender criterion', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Gender' }));

      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'gender',
          id: expect.stringContaining('gender-'),
          value: 'any',
        })
      );
    });

    it('should call onAddCriterion with hypertension condition', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Hypertension' }));

      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'condition',
          code: '59621000',
          display: 'Hypertension',
        })
      );
    });

    it('should call onAddCriterion with BMI observation', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add BMI' }));

      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'observation',
          code: '39156-5',
          display: 'BMI',
          comparator: 'gt',
          value: 0,
        })
      );
    });
  });

  describe('Section toggling', () => {
    it('should toggle demographics section', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      expect(screen.getByRole('button', { name: 'Add Age' })).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: 'Toggle Demographics section' })
      );

      expect(screen.queryByRole('button', { name: 'Add Age' })).not.toBeInTheDocument();
    });

    it('should toggle conditions section', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Toggle Conditions section' })
      );

      expect(
        screen.queryByRole('button', { name: 'Add Hypertension' })
      ).not.toBeInTheDocument();
    });

    it('should toggle observations section', () => {
      const onAdd = vi.fn();
      const onToggle = vi.fn();
      render(
        <CriteriaPanel
          onAddCriterion={onAdd}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Toggle Observations section' })
      );

      expect(
        screen.queryByRole('button', { name: 'Add BMI' })
      ).not.toBeInTheDocument();
    });
  });
});
