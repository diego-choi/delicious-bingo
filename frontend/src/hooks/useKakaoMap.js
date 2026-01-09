import { useEffect, useSyncExternalStore } from 'react';

const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

// 전역 상태 관리
let kakaoSDKState = {
  isLoaded: false,
  error: null,
  loading: false,
};
const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return kakaoSDKState;
}

function notifyListeners() {
  listeners.forEach((callback) => callback());
}

function loadKakaoSDK() {
  const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;

  // 이미 로드된 경우
  if (window.kakao?.maps) {
    kakaoSDKState = { isLoaded: true, error: null, loading: false };
    notifyListeners();
    return;
  }

  // API 키가 없는 경우
  if (!kakaoKey) {
    kakaoSDKState = {
      isLoaded: false,
      error: new Error('카카오맵 API 키가 설정되지 않았습니다.'),
      loading: false,
    };
    notifyListeners();
    return;
  }

  // 이미 로딩 중인 경우
  if (kakaoSDKState.loading) {
    return;
  }

  // 이미 스크립트가 존재하는 경우
  const existingScript = document.querySelector(`script[src^="${KAKAO_SDK_URL}"]`);
  if (existingScript) {
    kakaoSDKState = { ...kakaoSDKState, loading: true };
    notifyListeners();

    existingScript.addEventListener('load', () => {
      window.kakao.maps.load(() => {
        kakaoSDKState = { isLoaded: true, error: null, loading: false };
        notifyListeners();
      });
    });
    return;
  }

  // 스크립트 동적 로드
  kakaoSDKState = { ...kakaoSDKState, loading: true };
  notifyListeners();

  const script = document.createElement('script');
  script.src = `${KAKAO_SDK_URL}?appkey=${kakaoKey}&autoload=false`;
  script.async = true;

  script.onload = () => {
    window.kakao.maps.load(() => {
      kakaoSDKState = { isLoaded: true, error: null, loading: false };
      notifyListeners();
    });
  };

  script.onerror = () => {
    kakaoSDKState = {
      isLoaded: false,
      error: new Error('카카오맵 SDK 로드에 실패했습니다.'),
      loading: false,
    };
    notifyListeners();
  };

  document.head.appendChild(script);
}

/**
 * 카카오맵 SDK를 동적으로 로드하는 훅
 * @returns {{ isLoaded: boolean, error: Error | null }}
 */
export function useKakaoMapSDK() {
  const state = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!state.isLoaded && !state.error && !state.loading) {
      loadKakaoSDK();
    }
  }, [state.isLoaded, state.error, state.loading]);

  return { isLoaded: state.isLoaded, error: state.error };
}
