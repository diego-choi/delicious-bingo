import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/endpoints';

/**
 * 사용자 프로필 데이터 조회 훅
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authApi.getProfile();
      return response.data;
    },
  });
}

/**
 * 사용자 프로필 수정 훅
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await authApi.updateProfile(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
