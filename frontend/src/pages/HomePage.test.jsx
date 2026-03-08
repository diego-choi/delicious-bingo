import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './HomePage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../hooks/useTemplates', () => ({
  useTemplates: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));

vi.mock('../components/common/OnboardingModal', () => ({
  default: ({ isOpen, onClose, onStart }) =>
    isOpen ? (
      <div data-testid="onboarding-modal">
        <button onClick={onClose}>건너뛰기</button>
        <button onClick={() => { onClose(); onStart?.(); }}>시작하기</button>
      </div>
    ) : null,
}));

const ONBOARDING_KEY = 'delicious-bingo-onboarding-seen';

describe('HomePage', () => {
  let queryClient;

  const renderPage = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should show onboarding modal for first-time visitors', () => {
    renderPage();
    expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
  });

  it('should not show onboarding modal for returning visitors', () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    renderPage();
    expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
  });

  it('should set localStorage when onboarding is closed', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('건너뛰기'));

    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('true');
    expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
  });

  it('should navigate to /templates when clicking 시작하기', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('시작하기'));

    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('true');
    expect(mockNavigate).toHaveBeenCalledWith('/templates');
  });
});
