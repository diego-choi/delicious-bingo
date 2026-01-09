import { useState, useCallback } from 'react';
import { kakaoSearchApi } from '../api/adminEndpoints';

export function useKakaoSearch() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, x = null, y = null) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await kakaoSearchApi.search(query, x, y);
      setResults(response.data.results || []);
    } catch (err) {
      console.error('카카오 검색 실패:', err);
      setError(err.response?.data?.error || '검색에 실패했습니다.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clear,
  };
}
