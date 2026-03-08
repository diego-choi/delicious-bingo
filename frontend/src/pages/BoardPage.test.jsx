import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import BoardPage from './BoardPage';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../hooks/useBoards', () => ({
  useBoard: vi.fn(),
  useCreateReview: vi.fn(),
}));

// BingoGrid를 간소화하여 셀 클릭 트리거 가능하게 함
vi.mock('../components/bingo/BingoGrid', () => ({
  default: ({ cells, onCellClick }) => (
    <div data-testid="bingo-grid">
      {cells.map((cell) => (
        <button key={cell.position} onClick={() => onCellClick(cell)}>
          {cell.restaurant.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/modals/CellDetailModal', () => ({
  default: ({ onReviewSubmit }) => (
    <div data-testid="cell-modal">
      <button onClick={() => onReviewSubmit(new FormData())}>리뷰 제출</button>
    </div>
  ),
}));

vi.mock('../components/bingo/BingoHeader', () => ({
  default: () => <div data-testid="bingo-header" />,
}));

vi.mock('../components/bingo/CompletionCelebration', () => ({
  default: () => null,
}));

import { useBoard, useCreateReview } from '../hooks/useBoards';

const mockBoard = {
  id: 1,
  template_title: '테스트 빙고',
  target_line_count: 3,
  completed_lines: 0,
  is_completed: false,
  cells: [
    { position: 0, restaurant: { name: '맛집A' }, is_activated: false, review: null },
  ],
};

describe('BoardPage', () => {
  let queryClient;

  const renderPage = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/boards/1']}>
          <Routes>
            <Route path="/boards/:id" element={<BoardPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useBoard.mockReturnValue({ data: mockBoard, isLoading: false, error: null });
    useCreateReview.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it('shows success toast after review submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ bingo_completed: false });
    useCreateReview.mockReturnValue({ mutateAsync, isPending: false });

    renderPage();

    await userEvent.click(screen.getByText('맛집A'));
    await userEvent.click(screen.getByText('리뷰 제출'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('does not show success toast when bingo completed', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ bingo_completed: true, goal_achieved: true });
    useCreateReview.mockReturnValue({ mutateAsync, isPending: false });

    renderPage();

    await userEvent.click(screen.getByText('맛집A'));
    await userEvent.click(screen.getByText('리뷰 제출'));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows error toast on review submit failure', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'));
    useCreateReview.mockReturnValue({ mutateAsync, isPending: false });

    renderPage();

    await userEvent.click(screen.getByText('맛집A'));
    await userEvent.click(screen.getByText('리뷰 제출'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
