import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '../api/endpoints';

/**
 * 리더보드 데이터 조회 훅
 * @returns {Object} React Query 결과
 */
export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await leaderboardApi.get();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
