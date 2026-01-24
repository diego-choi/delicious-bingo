import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * 카카오 OAuth 콜백 처리 페이지
 * 카카오 인증 후 리다이렉트되어 인가 코드를 처리
 */
export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithKakao } = useAuth();
  const [error, setError] = useState(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // 중복 처리 방지
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // 카카오 인증 에러 처리
    if (errorParam) {
      console.error('Kakao OAuth error:', errorParam, errorDescription);
      setError(errorDescription || '카카오 로그인이 취소되었습니다.');
      return;
    }

    // 인가 코드 또는 state 없음
    if (!code || !state) {
      setError('인증 정보가 올바르지 않습니다.');
      return;
    }

    // Backend로 code와 state 전송 (state 검증은 Backend에서 처리)
    loginWithKakao(code, state)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((err) => {
        console.error('Kakao login failed:', err);
        const errorMessage =
          err.response?.data?.error || '로그인 처리 중 오류가 발생했습니다.';
        setError(errorMessage);
      });
  }, [searchParams, loginWithKakao, navigate]);

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">로그인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange/90 transition-colors"
          >
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 로딩 화면
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
}
