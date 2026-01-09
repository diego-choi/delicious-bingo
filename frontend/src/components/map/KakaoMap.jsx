import { useEffect, useRef } from 'react';
import { useKakaoMapSDK } from '../../hooks/useKakaoMap';

/**
 * 카카오맵 컴포넌트
 * @param {Object} props
 * @param {number} props.latitude - 위도
 * @param {number} props.longitude - 경도
 * @param {string} props.name - 맛집 이름
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function KakaoMap({
  latitude,
  longitude,
  name,
  className = '',
}) {
  const mapRef = useRef(null);
  const { isLoaded, error } = useKakaoMapSDK();

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !latitude || !longitude) return;

    const { kakao } = window;

    // 지도 생성
    const position = new kakao.maps.LatLng(latitude, longitude);
    const options = {
      center: position,
      level: 3, // 확대 레벨
    };

    const map = new kakao.maps.Map(mapRef.current, options);

    // 마커 생성
    const marker = new kakao.maps.Marker({
      position,
      map,
    });

    // 인포윈도우 생성
    if (name) {
      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;white-space:nowrap;">${name}</div>`,
      });
      infowindow.open(map, marker);
    }

    // 지도 컨트롤 추가
    const zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  }, [isLoaded, latitude, longitude, name]);

  // 좌표가 없는 경우
  if (!latitude || !longitude) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-sm">위치 정보가 없습니다.</p>
      </div>
    );
  }

  // SDK 로드 에러
  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <p className="text-gray-500 text-sm mb-2">지도를 불러올 수 없습니다.</p>
          <a
            href={`https://map.kakao.com/link/map/${name},${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 text-sm hover:underline"
          >
            카카오맵에서 보기 →
          </a>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {/* 카카오맵 링크 */}
      <a
        href={`https://map.kakao.com/link/map/${name},${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 hover:bg-white"
      >
        크게 보기
      </a>
    </div>
  );
}
