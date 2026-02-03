import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import DemoPage from './DemoPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function TestWrapper({ children }: { children: ReactNode }): ReactNode {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('DemoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page heading', () => {
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    expect(
      screen.getByRole('heading', { name: 'Cohort Search Builder Demo' })
    ).toBeInTheDocument();
  });

  it('should render "Start Building" button', () => {
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    expect(
      screen.getByRole('button', { name: 'Start Building' })
    ).toBeInTheDocument();
  });

  it('should render "Back" link', () => {
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('should navigate to builder page when "Start Building" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Start Building' }));

    expect(mockNavigate).toHaveBeenCalledWith('/builder');
  });

  it('should display description text', () => {
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    expect(
      screen.getByText(/Build FHIR R4 patient search queries/i)
    ).toBeInTheDocument();
  });
});
