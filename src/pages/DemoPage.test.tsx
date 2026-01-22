import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import DemoPage from './DemoPage';
import { QuestionnaireProvider } from '../context/QuestionnaireContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function TestWrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <QuestionnaireProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </QuestionnaireProvider>
  );
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
      screen.getByRole('heading', { name: 'eCRF Builder Demo' })
    ).toBeInTheDocument();
  });

  it('should render "Create new eCRF" button', () => {
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    expect(
      screen.getByRole('button', { name: 'Create new eCRF' })
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

  it('should open modal when "Create new eCRF" button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Create new eCRF' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
  });

  it('should close modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Create new eCRF' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should navigate to builder page after creating questionnaire', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Create new eCRF' }));
    await user.type(screen.getByLabelText(/Title/), 'Type 2 Diabetes');
    await user.selectOptions(screen.getByLabelText(/Status/), 'draft');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/builder\/.+/));
    });
  });

  it('should close modal after creating questionnaire', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <DemoPage />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Create new eCRF' }));
    await user.type(screen.getByLabelText(/Title/), 'Type 2 Diabetes');
    await user.selectOptions(screen.getByLabelText(/Status/), 'draft');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
