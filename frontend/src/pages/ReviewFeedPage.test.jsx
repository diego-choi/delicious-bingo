import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../contexts/authContext';
import ReviewFeedPage from './ReviewFeedPage';

vi.mock('../api/endpoints', () => ({
  reviewsApi: {
    getFeed: vi.fn(),
    toggleLike: vi.fn(),
    getComments: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

import { reviewsApi } from '../api/endpoints';

describe('ReviewFeedPage', () => {
  let queryClient;

  const mockAuthContext = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };

  const renderPage = (authContext = mockAuthContext) => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authContext}>
          <BrowserRouter>
            <ReviewFeedPage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    reviewsApi.getFeed.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();
    expect(screen.getByText('리뷰를 불러오는 중...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    reviewsApi.getFeed.mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByText('리뷰를 불러오는데 실패했습니다.')
      ).toBeInTheDocument();
    });
  });

  it('shows empty state when no reviews', async () => {
    reviewsApi.getFeed.mockResolvedValue({
      data: { count: 0, next: null, results: [] },
    });
    renderPage();
    await waitFor(() => {
      expect(
        screen.getByText('아직 공개된 리뷰가 없습니다.')
      ).toBeInTheDocument();
    });
  });

  it('renders review cards with required fields', async () => {
    reviewsApi.getFeed.mockResolvedValue({
      data: {
        count: 1,
        next: null,
        results: [
          {
            id: 1,
            display_name: '닉네임유저',
            restaurant_name: '을밀대',
            content: '맛있었습니다 강력 추천합니다',
            rating: 5,
            visited_date: '2025-01-01',
            image: null,
            like_count: 3,
            comment_count: 1,
            is_liked: false,
          },
        ],
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('닉네임유저')).toBeInTheDocument();
      expect(screen.getByText('을밀대')).toBeInTheDocument();
      expect(
        screen.getByText('맛있었습니다 강력 추천합니다')
      ).toBeInTheDocument();
      expect(screen.getByText('방문일: 2025-01-01')).toBeInTheDocument();
    });
  });

  it('shows "더 보기" button when hasNextPage', async () => {
    reviewsApi.getFeed.mockResolvedValue({
      data: {
        count: 30,
        next: 'http://localhost:8000/api/reviews/feed/?page=2',
        results: [
          {
            id: 1,
            display_name: '유저',
            restaurant_name: '맛집',
            content: '리뷰 내용입니다',
            rating: 4,
            visited_date: '2025-01-01',
            image: null,
            like_count: 0,
            comment_count: 0,
            is_liked: false,
          },
        ],
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('더 보기')).toBeInTheDocument();
    });
  });
});
