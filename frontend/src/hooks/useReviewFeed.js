import { useInfiniteQuery } from '@tanstack/react-query';
import { reviewsApi } from '../api/endpoints';

export function useReviewFeed() {
  return useInfiniteQuery({
    queryKey: ['reviewFeed'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await reviewsApi.getFeed(pageParam);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      return Number(url.searchParams.get('page'));
    },
  });
}
