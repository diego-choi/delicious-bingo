import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/endpoints';

export function useToggleLike(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId) => {
      const response = await reviewsApi.toggleLike(reviewId);
      return response.data;
    },
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['board', String(boardId)] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviewFeed'] });
    },
  });
}

export function useReviewComments(reviewId) {
  return useQuery({
    queryKey: ['reviewComments', reviewId],
    queryFn: async () => {
      const response = await reviewsApi.getComments(reviewId);
      return response.data;
    },
    enabled: !!reviewId,
  });
}

export function useCreateComment(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, content }) => {
      const response = await reviewsApi.createComment(reviewId, content);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reviewComments', variables.reviewId],
      });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['board', String(boardId)] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviewFeed'] });
    },
  });
}

export function useDeleteComment(boardId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, commentId }) => {
      await reviewsApi.deleteComment(reviewId, commentId);
      return { reviewId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['reviewComments', data.reviewId],
      });
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['board', String(boardId)] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviewFeed'] });
    },
  });
}
