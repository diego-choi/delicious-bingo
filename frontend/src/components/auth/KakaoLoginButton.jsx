import { useState } from 'react';
import { authApi } from '../../api/endpoints';

/**
 * 카카오 로그인 버튼 컴포넌트
 * 클릭 시 Backend에서 OAuth URL을 받아 카카오로 리다이렉트
 */
export function KakaoLoginButton({ className = '', disabled = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth/kakao/callback`;
      const response = await authApi.kakaoAuthorize(redirectUri);
      const { url } = response.data;

      window.location.href = url;
    } catch (error) {
      console.error('Failed to get Kakao auth URL:', error);
      alert('카카오 로그인을 시작할 수 없습니다.');
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors bg-[#FEE500] text-[#000000] hover:bg-[#FDD835] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0C4.02944 0 0 3.28538 0 7.34034C0 9.97405 1.75227 12.287 4.38636 13.5923L3.27273 17.5068C3.18182 17.8523 3.59091 18.125 3.90909 17.9261L8.18182 15.0341C8.45455 15.0511 8.72727 15.0682 9 15.0682C13.9706 15.0682 18 11.7828 18 7.72784C18 3.67287 13.9706 0 9 0Z"
          fill="currentColor"
        />
      </svg>
      <span>{isLoading ? '로딩 중...' : '카카오로 시작하기'}</span>
    </button>
  );
}
