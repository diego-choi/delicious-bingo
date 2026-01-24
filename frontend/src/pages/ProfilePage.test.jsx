import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './ProfilePage';
import { AuthContext } from '../contexts/authContext';

// Mock the API
vi.mock('../api/endpoints', () => ({
  authApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

import { authApi } from '../api/endpoints';

describe('ProfilePage', () => {
  let queryClient;
  const mockUpdateUser = vi.fn();

  const mockAuthContextValue = {
    user: { id: 1, username: 'testuser', display_name: 'testuser' },
    isLoading: false,
    isAuthenticated: true,
    updateUser: mockUpdateUser,
  };

  const mockProfileData = {
    user: {
      id: 1,
      username: 'testuser',
      display_name: '테스트유저',
      nickname: '테스트유저',
      date_joined: '2025-01-01T00:00:00Z',
    },
    statistics: {
      total_boards: 5,
      completed_boards: 3,
      total_reviews: 15,
      average_rating: 4.2,
    },
    recent_activity: {
      completed_boards: [
        {
          id: 1,
          template_title: '평양냉면 빙고',
          completed_at: '2025-01-15T10:30:00Z',
          target_line_count: 3,
        },
      ],
      recent_reviews: [
        {
          id: 1,
          restaurant_name: '을밀대',
          rating: 5,
          visited_date: '2025-01-14',
          created_at: '2025-01-14T15:00:00Z',
        },
      ],
    },
  };

  const renderPage = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuthContextValue}>
          <BrowserRouter>
            <ProfilePage />
          </BrowserRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUser.mockClear();
  });

  describe('렌더링', () => {
    it('로딩 상태를 표시해야 한다', () => {
      authApi.getProfile.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByText('프로필을 불러오는 중...')).toBeInTheDocument();
    });

    it('프로필 데이터를 표시해야 한다', async () => {
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('테스트유저')).toBeInTheDocument();
      });
    });

    it('통계를 표시해야 한다', async () => {
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // total_boards
        expect(screen.getByText('3')).toBeInTheDocument(); // completed_boards
        expect(screen.getByText('15')).toBeInTheDocument(); // total_reviews
        expect(screen.getByText('4.2')).toBeInTheDocument(); // average_rating
      });
    });

    it('최근 완료한 빙고를 표시해야 한다', async () => {
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('평양냉면 빙고')).toBeInTheDocument();
      });
    });

    it('최근 리뷰를 표시해야 한다', async () => {
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('을밀대')).toBeInTheDocument();
      });
    });

    it('빈 활동 목록일 때 안내 메시지를 표시해야 한다', async () => {
      const emptyData = {
        ...mockProfileData,
        recent_activity: {
          completed_boards: [],
          recent_reviews: [],
        },
      };
      authApi.getProfile.mockResolvedValue({ data: emptyData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('아직 완료한 빙고가 없습니다.')).toBeInTheDocument();
        expect(screen.getByText('아직 작성한 리뷰가 없습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('프로필 수정', () => {
    it('수정 버튼 클릭 시 폼이 표시되어야 한다', async () => {
      const user = userEvent.setup();
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('수정')).toBeInTheDocument();
      });

      await user.click(screen.getByText('수정'));

      expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
    });

    it('취소 버튼 클릭 시 폼이 닫혀야 한다', async () => {
      const user = userEvent.setup();
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('수정')).toBeInTheDocument();
      });

      await user.click(screen.getByText('수정'));
      await user.click(screen.getByText('취소'));

      expect(screen.queryByLabelText('닉네임')).not.toBeInTheDocument();
    });

    it('수정 후 저장이 성공해야 한다', async () => {
      const user = userEvent.setup();
      authApi.getProfile.mockResolvedValue({ data: mockProfileData });
      authApi.updateProfile.mockResolvedValue({
        data: { display_name: '새닉네임' },
      });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('수정')).toBeInTheDocument();
      });

      await user.click(screen.getByText('수정'));
      await user.clear(screen.getByLabelText('닉네임'));
      await user.type(screen.getByLabelText('닉네임'), '새닉네임');
      await user.click(screen.getByText('저장'));

      await waitFor(() => {
        expect(authApi.updateProfile).toHaveBeenCalledWith({
          nickname: '새닉네임',
        });
      });
    });
  });

  describe('에러 처리', () => {
    it('API 에러 시 에러 메시지를 표시해야 한다', async () => {
      authApi.getProfile.mockRejectedValue(new Error('Network error'));
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('프로필을 불러오는데 실패했습니다.')).toBeInTheDocument();
      });
    });

    it('에러 시 홈 링크를 표시해야 한다', async () => {
      authApi.getProfile.mockRejectedValue(new Error('Network error'));
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('홈으로 돌아가기')).toBeInTheDocument();
      });
    });
  });
});
