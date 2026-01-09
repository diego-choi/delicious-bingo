import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBoard, useCreateReview } from './useBoards';

// Mock the API endpoints
vi.mock('../api/endpoints', () => ({
  boardsApi: {
    getById: vi.fn(),
  },
  reviewsApi: {
    create: vi.fn(),
  },
}));

import { boardsApi, reviewsApi } from '../api/endpoints';

describe('useBoards hooks', () => {
  let queryClient;

  const createWrapper = () => {
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('Query key type consistency', () => {
    it('useBoard uses string id from params', async () => {
      const mockBoard = { id: 1, cells: [] };
      boardsApi.getById.mockResolvedValue({ data: mockBoard });

      // useParams returns string id
      const stringId = '1';
      const { result } = renderHook(() => useBoard(stringId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify the query was cached with string key
      const cachedData = queryClient.getQueryData(['board', '1']);
      expect(cachedData).toEqual(mockBoard);

      // Verify number key does NOT have the data (this was the bug)
      const wrongKeyData = queryClient.getQueryData(['board', 1]);
      expect(wrongKeyData).toBeUndefined();
    });

    it('useCreateReview invalidates with string board id (fix verification)', async () => {
      // Setup: Pre-populate cache with string key (as useBoard does)
      const mockBoard = { id: 1, cells: [], is_completed: false };
      queryClient.setQueryData(['board', '1'], mockBoard);

      // Mock successful review creation
      const mockReviewResponse = {
        id: 1,
        bingo_board: 1, // API returns number
        bingo_completed: false,
        goal_achieved: false,
      };
      reviewsApi.create.mockResolvedValue({ data: mockReviewResponse });

      // Track invalidation calls
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateReview(), {
        wrapper: createWrapper(),
      });

      // Submit review
      await act(async () => {
        await result.current.mutateAsync(new FormData());
      });

      // Verify invalidateQueries was called with STRING board id
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['board', '1'], // String, not number
      });

      // Also verify boards list was invalidated
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['boards'],
      });
    });

    it('cache invalidation works correctly after review submission', async () => {
      // Setup: Pre-populate cache with board data
      const initialBoard = {
        id: 1,
        cells: [{ position: 0, is_activated: false }],
        is_completed: false,
      };
      queryClient.setQueryData(['board', '1'], initialBoard);
      queryClient.setQueryData(['boards'], [initialBoard]);

      // Mock API calls
      const updatedBoard = {
        id: 1,
        cells: [{ position: 0, is_activated: true }],
        is_completed: false,
      };
      boardsApi.getById.mockResolvedValue({ data: updatedBoard });

      const mockReviewResponse = {
        id: 1,
        bingo_board: 1,
        bingo_completed: false,
      };
      reviewsApi.create.mockResolvedValue({ data: mockReviewResponse });

      // Render both hooks
      const { result: boardResult } = renderHook(() => useBoard('1'), {
        wrapper: createWrapper(),
      });

      const { result: reviewResult } = renderHook(() => useCreateReview(), {
        wrapper: createWrapper(),
      });

      // Initial data should be from cache
      expect(boardResult.current.data).toEqual(initialBoard);

      // Submit review
      await act(async () => {
        await reviewResult.current.mutateAsync(new FormData());
      });

      // After invalidation, the query should refetch
      await waitFor(() => {
        expect(boardsApi.getById).toHaveBeenCalled();
      });
    });
  });

  describe('useCreateReview', () => {
    it('returns bingo_completed and goal_achieved from response', async () => {
      const mockResponse = {
        id: 1,
        bingo_board: 1,
        bingo_completed: true,
        goal_achieved: true,
      };
      reviewsApi.create.mockResolvedValue({ data: mockResponse });

      const { result } = renderHook(() => useCreateReview(), {
        wrapper: createWrapper(),
      });

      let responseData;
      await act(async () => {
        responseData = await result.current.mutateAsync(new FormData());
      });

      expect(responseData.bingo_completed).toBe(true);
      expect(responseData.goal_achieved).toBe(true);
    });

    it('handles review without bingo_board gracefully', async () => {
      const mockResponse = {
        id: 1,
        // bingo_board is missing
        bingo_completed: false,
      };
      reviewsApi.create.mockResolvedValue({ data: mockResponse });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateReview(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(new FormData());
      });

      // Should only invalidate boards list, not specific board
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['boards'],
      });
    });
  });
});
