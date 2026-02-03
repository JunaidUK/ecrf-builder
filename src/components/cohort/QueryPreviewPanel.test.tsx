import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryPreviewPanel } from './QueryPreviewPanel';

describe('QueryPreviewPanel', () => {
  const mockClipboard = {
    writeText: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render header', () => {
    render(
      <QueryPreviewPanel
        query="/Patient"
        isExpanded={true}
        onToggleExpand={vi.fn()}
      />
    );

    expect(screen.getByText('Query Preview')).toBeInTheDocument();
  });

  it('should render toggle button', () => {
    render(
      <QueryPreviewPanel
        query="/Patient"
        isExpanded={true}
        onToggleExpand={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Collapse query preview' })
    ).toBeInTheDocument();
  });

  it('should show expand button when collapsed', () => {
    render(
      <QueryPreviewPanel
        query="/Patient"
        isExpanded={false}
        onToggleExpand={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Expand query preview' })
    ).toBeInTheDocument();
  });

  it('should call onToggleExpand when toggle clicked', () => {
    const onToggle = vi.fn();
    render(
      <QueryPreviewPanel
        query="/Patient"
        isExpanded={true}
        onToggleExpand={onToggle}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse query preview' })
    );

    expect(onToggle).toHaveBeenCalled();
  });

  describe('Expanded state', () => {
    it('should display query when expanded', () => {
      render(
        <QueryPreviewPanel
          query="/Patient?gender=female"
          isExpanded={true}
          onToggleExpand={vi.fn()}
        />
      );

      expect(screen.getByText('/Patient?gender=female')).toBeInTheDocument();
    });

    it('should render copy button when expanded', () => {
      render(
        <QueryPreviewPanel
          query="/Patient"
          isExpanded={true}
          onToggleExpand={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Copy query to clipboard' })
      ).toBeInTheDocument();
    });

    it('should not display query content when collapsed', () => {
      render(
        <QueryPreviewPanel
          query="/Patient?gender=female"
          isExpanded={false}
          onToggleExpand={vi.fn()}
        />
      );

      expect(
        screen.queryByText('/Patient?gender=female')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Copy query to clipboard' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('should copy query to clipboard when copy button clicked', async () => {
      vi.useRealTimers();
      render(
        <QueryPreviewPanel
          query="/Patient?gender=female"
          isExpanded={true}
          onToggleExpand={vi.fn()}
        />
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Copy query to clipboard' })
      );

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          '/Patient?gender=female'
        );
      });
    });

    it('should show success message after copying', async () => {
      vi.useRealTimers();
      render(
        <QueryPreviewPanel
          query="/Patient"
          isExpanded={true}
          onToggleExpand={vi.fn()}
        />
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Copy query to clipboard' })
      );

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Complex queries', () => {
    it('should display long query with proper wrapping', () => {
      const longQuery =
        '/Patient?birthdate=ge1960-01-29&birthdate=le1986-01-28&gender=female&_has:Condition:patient:code=http%3A%2F%2Fhl7.org%2Ffhir%2Fsid%2Ficd-10-cm%7CI10';

      render(
        <QueryPreviewPanel
          query={longQuery}
          isExpanded={true}
          onToggleExpand={vi.fn()}
        />
      );

      expect(screen.getByText(longQuery)).toBeInTheDocument();
    });
  });
});
