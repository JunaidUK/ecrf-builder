import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConditionAutocomplete } from './ConditionAutocomplete';

vi.mock('../../../services/terminology-client', () => ({
  searchConditionsWithICD10: vi.fn(),
}));

import { searchConditionsWithICD10 } from '../../../services/terminology-client';

describe('ConditionAutocomplete', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('should render input field', () => {
    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for a condition...')).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    render(
      <ConditionAutocomplete
        onSelect={mockOnSelect}
        placeholder="Type a condition name"
      />
    );

    expect(screen.getByPlaceholderText('Type a condition name')).toBeInTheDocument();
  });

  it('should not search for short terms', async () => {
    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(searchConditionsWithICD10).not.toHaveBeenCalled();
  });

  it('should search after debounce delay', async () => {
    vi.mocked(searchConditionsWithICD10).mockResolvedValue([
      {
        snomedCode: '38341003',
        snomedDisplay: 'Hypertension',
        icd10Code: 'I10',
      },
    ]);

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'hypertension' } });

    expect(searchConditionsWithICD10).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(searchConditionsWithICD10).toHaveBeenCalledWith('hypertension', 15);
  });

  it('should display search results', async () => {
    vi.mocked(searchConditionsWithICD10).mockResolvedValue([
      {
        snomedCode: '38341003',
        snomedDisplay: 'Hypertension',
        icd10Code: 'I10',
      },
      {
        snomedCode: '73211009',
        snomedDisplay: 'Diabetes mellitus',
        icd10Code: 'E11',
      },
    ]);

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Diabetes mellitus')).toBeInTheDocument();
    expect(screen.getByText('I10')).toBeInTheDocument();
    expect(screen.getByText('E11')).toBeInTheDocument();
  });

  it('should call onSelect when result is clicked', async () => {
    const mockResult = {
      snomedCode: '38341003',
      snomedDisplay: 'Hypertension',
      icd10Code: 'I10',
    };

    vi.mocked(searchConditionsWithICD10).mockResolvedValue([mockResult]);

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'hypertension' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Hypertension')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hypertension'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockResult);
  });

  it('should clear input after selection', async () => {
    vi.mocked(searchConditionsWithICD10).mockResolvedValue([
      {
        snomedCode: '38341003',
        snomedDisplay: 'Hypertension',
        icd10Code: 'I10',
      },
    ]);

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hypertension' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Hypertension')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hypertension'));

    expect(input.value).toBe('');
  });

  it('should navigate results with arrow keys', async () => {
    vi.mocked(searchConditionsWithICD10).mockResolvedValue([
      {
        snomedCode: '38341003',
        snomedDisplay: 'Hypertension',
        icd10Code: 'I10',
      },
      {
        snomedCode: '73211009',
        snomedDisplay: 'Diabetes',
        icd10Code: 'E11',
      },
    ]);

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Hypertension')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ snomedDisplay: 'Hypertension' })
    );
  });

  it('should close dropdown on Escape', async () => {
    vi.mocked(searchConditionsWithICD10).mockResolvedValue([
      {
        snomedCode: '38341003',
        snomedDisplay: 'Hypertension',
        icd10Code: 'I10',
      },
    ]);

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Hypertension')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should show error message on search failure', async () => {
    vi.mocked(searchConditionsWithICD10).mockRejectedValue(
      new Error('Connection failed')
    );

    render(<ConditionAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Connection failed');
  });

  it('should disable input when disabled prop is true', () => {
    render(<ConditionAutocomplete onSelect={mockOnSelect} disabled={true} />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
