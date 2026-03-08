# TODO - 향후 개선 계획

우선순위 기준: 보안 > 안정성/운영 > 사용자 경험 > 기능 확장

## P0: 보안 및 운영 필수
- [x] API Rate Limiting (로그인/회원가입 brute force 방지)
- [x] Health Check 엔드포인트 (`/api/health/`)
- [x] 에러 모니터링 (Sentry 연동)
- [x] 이미지 업로드 검증 (파일 타입, 용량 제한)
- [x] DB 인덱스 추가 (Review, BingoBoard 등 주요 FK)
- [x] OCI Always Free Tier 이전 (Fly.io → OCI x86 VM Chuncheon)

## P1: 안정성 및 프로덕션 퀄리티
- [x] 글로벌 에러 바운더리 + 토스트 알림 (react-hot-toast)
- [x] API 요청 실패 시 재시도 로직 (axios-retry)
- [x] 페이지별 로딩 스켈레톤
- [x] 삭제 확인 다이얼로그 (빙고판 삭제 등)
- [x] 빈 상태 UI (보드 없음, 리뷰 없음 등)
- [x] Gunicorn 워커 설정 최적화

## P2: 사용자 경험 개선
- [x] ConfirmDialog 접근성 개선 (role/aria-modal, ESC 키 닫기, 포커스 트랩)
- [ ] 모달 접근성 공통 훅 추출 (`useModalA11y`: ESC 닫기, 포커스 트랩, 스크롤 잠금) → ConfirmDialog, CellDetailModal, CompletionCelebration 적용
- [ ] 페이지별 로딩 표시 일관성 통일 (스켈레톤 미적용 페이지 보완)
- [ ] 맛집/템플릿 검색 및 카테고리 필터
- [ ] SEO 메타 태그 (react-helmet-async)
- [ ] 404 Not Found 페이지
- [ ] 리뷰 작성 성공 토스트 + 빙고 완성 축하 피드백 강화
- [ ] 폼 클라이언트 사이드 검증 (입력 하이라이트)
- [ ] 다크 모드

## P3: 기능 확장
- [ ] API 문서 자동 생성 (drf-spectacular)
- [ ] 템플릿 공유 기능
- [ ] 사용자 생성 템플릿
- [ ] 알림 시스템 (좋아요, 댓글)
- [ ] 빙고판 이미지 추출 (진행 중/완성 상태를 이미지로 저장, 인스타그램 등 SNS 공유)
- [ ] 그룹 빙고 챌린지
- [ ] PWA / 오프라인 지원
