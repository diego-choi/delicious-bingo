import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/endpoints';
import { useAuth } from './useAuth';

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
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      const response = await authApi.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      // AuthContext의 사용자 정보 업데이트 (네비게이션 바 반영)
      if (data.display_name) {
        updateUser({ display_name: data.display_name });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
