import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi, reviewsApi } from '../api/endpoints';

// 내 빙고 보드 목록 조회
export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await boardsApi.getAll();
      return response.data;
    },
  });
}

// 특정 빙고 보드 조회
export function useBoard(id) {
  return useQuery({
    queryKey: ['board', id],
    queryFn: async () => {
      const response = await boardsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// 빙고 보드 생성
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await boardsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

// 빙고 보드 삭제
export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await boardsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

// 리뷰 생성 (셀 활성화)
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await reviewsApi.create(formData);
      return response.data;
    },
    onSuccess: (data) => {
      // 해당 보드 데이터 갱신
      if (data.bingo_board) {
        queryClient.invalidateQueries({ queryKey: ['board', data.bingo_board] });
      }
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

// 리뷰 조회
export function useReview(id) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const response = await reviewsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
