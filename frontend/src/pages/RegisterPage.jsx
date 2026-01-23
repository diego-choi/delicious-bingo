import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 제거
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await register(formData);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          general: '회원가입에 실패했습니다. 다시 시도해주세요.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-0 py-6 sm:py-0">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">회원가입</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">맛집 빙고 도전을 시작하세요!</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              사용자명
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="3~20자의 사용자명"
              required
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="example@email.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="6자 이상의 비밀번호"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password_confirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호 확인
            </label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent ${
                errors.password_confirm ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {errors.password_confirm && (
              <p className="mt-1 text-sm text-red-500">{errors.password_confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-brand-orange hover:text-brand-orange/80 font-medium">
            로그인
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
