import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useToggleLike,
  useReviewComments,
  useCreateComment,
  useDeleteComment,
} from './useReviewSocial';

vi.mock('../api/endpoints', () => ({
  reviewsApi: {
    toggleLike: vi.fn(),
    getComments: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

import { reviewsApi } from '../api/endpoints';

describe('useReviewSocial hooks', () => {
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

  describe('useToggleLike', () => {
    it('calls toggleLike API and returns result', async () => {
      reviewsApi.toggleLike.mockResolvedValue({
        data: { is_liked: true, like_count: 1 },
      });

      const { result } = renderHook(() => useToggleLike('5'), {
        wrapper: createWrapper(),
      });

      let data;
      await act(async () => {
        data = await result.current.mutateAsync(42);
      });

      expect(reviewsApi.toggleLike).toHaveBeenCalledWith(42);
      expect(data.is_liked).toBe(true);
      expect(data.like_count).toBe(1);
    });

    it('invalidates board query on success', async () => {
      reviewsApi.toggleLike.mockResolvedValue({
        data: { is_liked: true, like_count: 1 },
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useToggleLike('5'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(42);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['board', '5'],
      });
    });
  });

  describe('useReviewComments', () => {
    it('fetches comments for a review', async () => {
      const mockComments = [
        { id: 1, content: '댓글1', username: 'user1' },
        { id: 2, content: '댓글2', username: 'user2' },
      ];
      reviewsApi.getComments.mockResolvedValue({ data: mockComments });

      const { result } = renderHook(() => useReviewComments(42), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockComments);
    });

    it('does not fetch when reviewId is falsy', () => {
      const { result } = renderHook(() => useReviewComments(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(reviewsApi.getComments).not.toHaveBeenCalled();
    });
  });

  describe('useCreateComment', () => {
    it('creates comment and invalidates queries', async () => {
      reviewsApi.createComment.mockResolvedValue({
        data: { id: 1, content: '새 댓글', username: 'user1' },
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateComment('5'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ reviewId: 42, content: '새 댓글' });
      });

      expect(reviewsApi.createComment).toHaveBeenCalledWith(42, '새 댓글');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['reviewComments', 42],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['board', '5'],
      });
    });
  });

  describe('useDeleteComment', () => {
    it('deletes comment and invalidates queries', async () => {
      reviewsApi.deleteComment.mockResolvedValue({});

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteComment('5'), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ reviewId: 42, commentId: 7 });
      });

      expect(reviewsApi.deleteComment).toHaveBeenCalledWith(42, 7);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['reviewComments', 42],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['board', '5'],
      });
    });
  });
});
