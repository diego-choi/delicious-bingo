import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthContext } from '../contexts/authContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage', () => {
  const mockRegister = vi.fn();

  const renderWithAuth = (registerFn = mockRegister) => {
    const authValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      register: registerFn,
      login: vi.fn(),
      logout: vi.fn(),
    };

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('회원가입 폼이 렌더링되어야 한다', () => {
      renderWithAuth();

      expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
      expect(screen.getByLabelText(/사용자명/)).toBeInTheDocument();
      expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
    });

    it('로그인 페이지 링크가 있어야 한다', () => {
      renderWithAuth();

      const loginLink = screen.getByRole('link', { name: '로그인' });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('홈으로 돌아가기 링크가 있어야 한다', () => {
      renderWithAuth();

      const homeLink = screen.getByRole('link', { name: '홈으로 돌아가기' });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('폼 입력', () => {
    it('입력 필드에 값을 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup();
      renderWithAuth();

      const usernameInput = screen.getByLabelText(/사용자명/);
      const emailInput = screen.getByLabelText(/이메일/);
      const passwordInput = screen.getByLabelText('비밀번호');
      const confirmInput = screen.getByLabelText('비밀번호 확인');

      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'password123');

      expect(usernameInput).toHaveValue('testuser');
      expect(emailInput).toHaveValue('test@test.com');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmInput).toHaveValue('password123');
    });
  });

  describe('폼 제출', () => {
    it('성공적인 회원가입 후 홈으로 이동해야 한다', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValueOnce({ id: 1, username: 'testuser' });
      renderWithAuth();

      await user.type(screen.getByLabelText(/사용자명/), 'testuser');
      await user.type(screen.getByLabelText(/이메일/), 'test@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123',
          password_confirm: 'password123',
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('제출 중에는 버튼이 비활성화되어야 한다', async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderWithAuth();

      await user.type(screen.getByLabelText(/사용자명/), 'testuser');
      await user.type(screen.getByLabelText(/이메일/), 'test@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '가입 중...' })).toBeDisabled();
      });
    });
  });

  describe('에러 처리', () => {
    it('API 에러 시 필드별 에러 메시지를 표시해야 한다', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValueOnce({
        response: {
          data: {
            errors: {
              username: '이미 사용 중인 사용자명입니다.',
              email: '이미 사용 중인 이메일입니다.',
            },
          },
        },
      });
      renderWithAuth();

      await user.type(screen.getByLabelText(/사용자명/), 'testuser');
      await user.type(screen.getByLabelText(/이메일/), 'test@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByText('이미 사용 중인 사용자명입니다.')).toBeInTheDocument();
        expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
      });
    });

    it('일반 에러 시 기본 에러 메시지를 표시해야 한다', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValueOnce(new Error('Network error'));
      renderWithAuth();

      await user.type(screen.getByLabelText(/사용자명/), 'testuser');
      await user.type(screen.getByLabelText(/이메일/), 'test@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByText('회원가입에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument();
      });
    });

    it('입력 시 해당 필드의 에러가 제거되어야 한다', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValueOnce({
        response: {
          data: {
            errors: {
              username: '사용자명 에러',
            },
          },
        },
      });
      renderWithAuth();

      await user.type(screen.getByLabelText(/사용자명/), 'test');
      await user.type(screen.getByLabelText(/이메일/), 'test@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(screen.getByText('사용자명 에러')).toBeInTheDocument();
      });

      // 사용자명 필드에 입력하면 에러가 사라져야 함
      await user.type(screen.getByLabelText(/사용자명/), 'user');

      await waitFor(() => {
        expect(screen.queryByText('사용자명 에러')).not.toBeInTheDocument();
      });
    });
  });

  describe('에러 스타일링', () => {
    it('에러가 있는 필드에 빨간 테두리가 적용되어야 한다', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValueOnce({
        response: {
          data: {
            errors: {
              username: '에러 메시지',
            },
          },
        },
      });
      renderWithAuth();

      await user.type(screen.getByLabelText(/사용자명/), 'test');
      await user.type(screen.getByLabelText(/이메일/), 'test@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.type(screen.getByLabelText('비밀번호 확인'), 'password123');
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/사용자명/);
        expect(usernameInput).toHaveClass('border-red-500');
      });
    });
  });
});
