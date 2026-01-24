import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile, useUpdateProfile } from './useProfile';
import { AuthContext } from '../contexts/authContext';

// Mock the API endpoints
vi.mock('../api/endpoints', () => ({
  authApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

import { authApi } from '../api/endpoints';

describe('useProfile hooks', () => {
  let queryClient;
  const mockUpdateUser = vi.fn();

  const mockAuthContextValue = {
    user: { id: 1, username: 'testuser' },
    isLoading: false,
    isAuthenticated: true,
    updateUser: mockUpdateUser,
  };

  const createWrapper = () => {
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContextValue}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  const mockProfileData = {
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@test.com',
      date_joined: '2025-01-01T00:00:00Z',
    },
    statistics: {
      total_boards: 5,
      completed_boards: 3,
      total_reviews: 15,
      average_rating: 4.2,
    },
    recent_activity: {
      completed_boards: [],
      recent_reviews: [],
    },
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
    mockUpdateUser.mockClear();
  });

  describe('useProfile', () => {
    it('프로필 데이터를 가져와야 한다', async () => {
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProfileData);
    });

    it('API 호출이 한 번만 되어야 한다', async () => {
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(authApi.getProfile).toHaveBeenCalledTimes(1);
    });

    it('에러 발생 시 error 상태를 반환해야 한다', async () => {
      authApi.getProfile.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error.message).toBe('Network error');
    });
  });

  describe('useUpdateProfile', () => {
    it('프로필 업데이트가 성공해야 한다', async () => {
      const updatedUser = { id: 1, username: 'newuser', email: 'new@test.com' };
      authApi.updateProfile.mockResolvedValue({ data: updatedUser });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      let responseData;
      await act(async () => {
        responseData = await result.current.mutateAsync({ username: 'newuser' });
      });

      expect(responseData).toEqual(updatedUser);
      expect(authApi.updateProfile).toHaveBeenCalledWith({ username: 'newuser' });
    });

    it('업데이트 후 profile 쿼리를 무효화해야 한다', async () => {
      const updatedUser = { id: 1, username: 'newuser', email: 'test@test.com' };
      authApi.updateProfile.mockResolvedValue({ data: updatedUser });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ username: 'newuser' });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] });
    });

    it('업데이트 실패 시 에러를 반환해야 한다', async () => {
      const error = new Error('Validation error');
      error.response = { data: { errors: { username: '이미 사용 중입니다.' } } };
      authApi.updateProfile.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ username: 'existing' });
        })
      ).rejects.toThrow('Validation error');
    });
  });
});
