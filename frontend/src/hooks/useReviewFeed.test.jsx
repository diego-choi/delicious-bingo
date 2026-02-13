import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReviewFeed } from './useReviewFeed';

vi.mock('../api/endpoints', () => ({
  reviewsApi: {
    getFeed: vi.fn(),
  },
}));

import { reviewsApi } from '../api/endpoints';

describe('useReviewFeed', () => {
  let queryClient;

  const createWrapper = () => {
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('fetches first page of feed', async () => {
    const mockData = {
      count: 2,
      next: null,
      results: [
        { id: 1, content: '리뷰1', restaurant_name: '맛집1' },
        { id: 2, content: '리뷰2', restaurant_name: '맛집2' },
      ],
    };
    reviewsApi.getFeed.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useReviewFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reviewsApi.getFeed).toHaveBeenCalledWith(1);
    expect(result.current.data.pages[0].results).toHaveLength(2);
  });

  it('extracts next page param from next URL', async () => {
    const mockData = {
      count: 30,
      next: 'http://localhost:8000/api/reviews/feed/?page=2',
      results: [{ id: 1, content: '리뷰1', restaurant_name: '맛집1' }],
    };
    reviewsApi.getFeed.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useReviewFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns hasNextPage false when next is null', async () => {
    const mockData = {
      count: 1,
      next: null,
      results: [{ id: 1, content: '리뷰1', restaurant_name: '맛집1' }],
    };
    reviewsApi.getFeed.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useReviewFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});
