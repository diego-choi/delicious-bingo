# Delicious Bingo 구현 계획

## 현재 상태: 모든 Phase 완료 + 프로덕션 배포 완료

- [x] Django 프로젝트 초기화
- [x] Django 모델 정의 (Category, Restaurant, BingoTemplate, BingoTemplateItem, BingoBoard, Review)
- [x] Django Admin 설정
- [x] Django 설정 구성 (CORS, DRF)
- [x] React + Vite 프로젝트 초기화
- [x] Tailwind CSS 설정
- [x] 모바일 반응형 디자인 적용
- [x] 프로덕션 배포 (Railway + Vercel)
- [x] E2E 테스트 구현

---

## Phase 1: 백엔드 API 기초 (Serializers, 기본 Views) ✅ 완료

### TODO
- [x] `backend/api/serializers.py` 생성
  - [x] CategorySerializer
  - [x] RestaurantSerializer
  - [x] BingoTemplateListSerializer
  - [x] BingoTemplateItemSerializer
  - [x] BingoTemplateDetailSerializer
- [x] `backend/api/urls.py` 생성
  - [x] DefaultRouter 설정
  - [x] templates, categories 라우트 등록
- [x] `backend/api/views.py` 수정
  - [x] CategoryViewSet (ReadOnly)
  - [x] BingoTemplateViewSet (ReadOnly, list/detail 분리)
- [x] `backend/config/urls.py` 수정
  - [x] `/api/` 경로 연결
  - [x] 미디어 파일 서빙 설정

### 검증
- [x] `GET /api/templates/` 테스트
- [x] `GET /api/templates/:id/` 테스트
- [x] `GET /api/categories/` 테스트

---

## Phase 2: 백엔드 API 완성 (빙고 보드, 리뷰, 게임 로직) ✅ 완료

### TODO
- [x] `backend/api/services.py` 생성
  - [x] BingoService 클래스
  - [x] WINNING_LINES 상수 (12개 라인)
  - [x] get_activated_positions() 메서드
  - [x] count_completed_lines() 메서드
  - [x] check_board_completion() 메서드
- [x] `backend/api/serializers.py` 추가
  - [x] ReviewSerializer
  - [x] ReviewCreateSerializer
  - [x] BingoBoardSerializer (cells, completed_lines, progress 포함)
  - [x] BingoBoardCreateSerializer
- [x] `backend/api/views.py` 추가
  - [x] BingoBoardViewSet
  - [x] ReviewViewSet (생성 시 빙고 완료 체크)
- [x] `backend/api/urls.py` 수정
  - [x] boards, reviews 라우트 등록

### 검증
- [x] `POST /api/boards/` 테스트 (인증 필요)
- [x] `GET /api/boards/:id/` 테스트 (5x5 그리드 데이터)
- [x] `POST /api/reviews/` 테스트 (셀 활성화 확인)
- [x] 빙고 완료 로직 테스트

---

## Phase 3: 프론트엔드 인프라 (라우팅, API 클라이언트, 상태 관리) ✅ 완료

### TODO
- [x] 패키지 설치 (react-router-dom, axios, @tanstack/react-query)
- [x] `frontend/src/api/client.js` 생성
  - [x] Axios 인스턴스 설정
  - [x] 인증 토큰 인터셉터
- [x] `frontend/src/api/endpoints.js` 생성
  - [x] templatesApi (getAll, getById)
  - [x] boardsApi (getAll, getById, create)
  - [x] reviewsApi (create)
- [x] `frontend/src/hooks/useTemplates.js` 생성
- [x] `frontend/src/hooks/useBoards.js` 생성
- [x] `frontend/src/router.jsx` 생성
- [x] `frontend/src/components/Layout.jsx` 생성 (모바일 햄버거 메뉴 포함)
- [x] `frontend/src/main.jsx` 수정
- [x] 모든 페이지 플레이스홀더 생성

### 검증
- [x] 모든 라우트 접근 확인
- [x] API 클라이언트 연결 확인
- [x] React Query 캐싱 동작 확인

---

## Phase 4: 핵심 게임 컴포넌트 (BingoGrid, BingoCell) ✅ 완료

### TODO
- [x] `frontend/src/components/bingo/BingoGrid.jsx` 생성
  - [x] 5x5 그리드 레이아웃 (grid-cols-5)
  - [x] 완료 라인 하이라이트 로직
  - [x] onCellClick 핸들러
- [x] `frontend/src/components/bingo/BingoCell.jsx` 생성
  - [x] 비활성화/활성화 상태 UI
  - [x] 하이라이트 상태 (빙고 라인)
  - [x] 호버 효과
- [x] `frontend/src/components/bingo/BingoHeader.jsx` 생성
- [x] `frontend/src/pages/BoardPage.jsx` 구현

### 검증
- [x] 5x5 그리드 정상 렌더링
- [x] 활성화된 셀 녹색 표시
- [x] 진행률 바 업데이트
- [x] 셀 클릭 이벤트 동작

---

## Phase 5: 리뷰 및 인터랙션 (ReviewModal, 폼 처리) ✅ 완료

### TODO
- [x] `frontend/src/components/modals/CellDetailModal.jsx` 생성
  - [x] 맛집 정보 표시
  - [x] 기존 리뷰 표시
  - [x] 리뷰 작성 폼 토글
  - [x] 모바일 바텀시트 UI
- [x] `frontend/src/components/forms/ReviewForm.jsx` 생성
  - [x] 이미지 업로드 (필수, 미리보기)
  - [x] 별점 선택 (1-5)
  - [x] 리뷰 내용 (최소 10자 검증)
  - [x] 방문일 선택
- [x] `frontend/src/pages/TemplateDetailPage.jsx` 구현
- [x] `frontend/src/pages/TemplateListPage.jsx` 구현

### 검증
- [x] 리뷰 폼 검증 동작
- [x] 리뷰 제출 후 셀 활성화
- [x] 도전 시작 → 보드 생성 → 리다이렉트

---

## Phase 6: 카카오맵 연동 ✅ 완료

### TODO
- [x] `frontend/src/components/map/KakaoMap.jsx` 생성
- [x] `frontend/src/hooks/useKakaoMap.js` 생성
- [x] CellDetailModal에 KakaoMap 통합

### 검증
- [x] 지도 정상 렌더링
- [x] 마커 위치 정확성
- [x] 인포윈도우 표시

---

## Phase 7: 리더보드 및 완료 기능 ✅ 완료

### TODO
- [x] `backend/api/views.py` - leaderboard() 함수 뷰 추가
- [x] `backend/api/urls.py` - `/api/leaderboard/` 경로 추가
- [x] `frontend/src/hooks/useLeaderboard.js` 생성
- [x] `frontend/src/pages/LeaderboardPage.jsx` 구현
- [x] `frontend/src/components/bingo/CompletionCelebration.jsx` 생성

### 검증
- [x] 리더보드 데이터 정상 로드
- [x] 빙고 완료 시 축하 모달 표시

---

## Phase 8: 테스트 및 마무리 ✅ 완료

### TODO
- [x] 백엔드 테스트 (55개 테스트)
  - [x] BingoService 라인 감지 테스트
  - [x] API 인증 테스트
  - [x] 리뷰 생성 → 빙고 완료 통합 테스트
- [x] 프론트엔드 테스트 (25개 테스트)
  - [x] Vitest + Testing Library 설정
  - [x] 컴포넌트 테스트
- [x] 공통 컴포넌트 생성
  - [x] ErrorBoundary
  - [x] LoadingSpinner
- [x] 커스텀 애니메이션 (bounce-in, pulse-line)

### 검증
- [x] `python manage.py test` 통과 (55 tests)
- [x] `npm run test:run` 통과 (25 tests)
- [x] `npm run build` 성공

---

## 추가 구현: 인증 시스템 ✅ 완료

- [x] Token Authentication 설정
- [x] 회원가입 API (`POST /api/auth/register/`)
- [x] 로그인 API (`POST /api/auth/login/`)
- [x] 로그아웃 API (`POST /api/auth/logout/`)
- [x] 현재 사용자 API (`GET /api/auth/me/`)
- [x] AuthContext + AuthProvider
- [x] LoginPage, RegisterPage
- [x] 테스트 계정 Production 숨김 (`import.meta.env.DEV`)

---

## 추가 구현: 모바일 반응형 ✅ 완료

- [x] 모바일 우선 디자인 (기본 모바일, sm: 데스크탑)
- [x] 햄버거 메뉴 네비게이션
- [x] 바텀시트 모달 (CellDetailModal)
- [x] 반응형 그리드/텍스트/간격
- [x] 터치 친화적 UI

---

## 추가 구현: 프로덕션 배포 ✅ 완료

### Backend (Railway)
- [x] Dockerfile + start.sh
- [x] PostgreSQL 연결
- [x] 환경변수 설정 (SECRET_KEY, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS)
- [x] 초기 데이터 fixture (loaddata initial_data)

### Frontend (Vercel)
- [x] vercel.json (SPA 라우팅 + 캐시 헤더)
- [x] 환경변수 설정 (VITE_API_URL)
- [x] stale-while-revalidate 캐시 전략

### 배포 URL
- Backend: https://delicious-bingo-production.up.railway.app
- Frontend: https://frontend-ashy-rho-12.vercel.app

---

## 추가 구현: E2E 프로덕션 테스트 ✅ 완료

- [x] Playwright 기반 테스트 스크립트
- [x] 12개 테스트 항목
- [x] `frontend/e2e-prod-test.cjs`

---

## 추가 구현: Cloudinary 클라우드 스토리지 ✅ 완료

### 문제
- 프로덕션에서 리뷰 이미지 404 오류
- Railway 컨테이너 휘발성 파일시스템
- WhiteNoise는 static 파일만 서빙 (media 미지원)

### 해결
- [x] cloudinary, django-cloudinary-storage 패키지 추가
- [x] Django 6.0 `STORAGES` 설정 구성
- [x] CLOUDINARY_URL 환경변수 기반 조건부 설정
- [x] TDD 방식으로 이미지 URL 테스트 추가

### 검증
- [x] 로컬 환경: 로컬 파일시스템 사용
- [x] 프로덕션 환경: Cloudinary 사용 (res.cloudinary.com 도메인)
- [x] 컨테이너 재시작 후 이미지 유지 확인

---

## E2E 테스트 체크리스트 ✅ 모두 완료

- [x] 템플릿 목록 조회
- [x] 템플릿 상세 보기
- [x] 목표 라인 설정 후 도전 시작
- [x] 빙고 보드 5x5 그리드 표시
- [x] 셀 클릭 → 맛집 상세 모달
- [x] 카카오맵 맛집 위치 표시
- [x] 리뷰 작성 (이미지, 내용, 평점)
- [x] 리뷰 제출 → 셀 활성화
- [x] 빙고 라인 완성 감지
- [x] 목표 달성 → 축하 모달
- [x] 리더보드 순위 확인

---

## 파일 구조 (최종)

```
delicious_bingo/
├── PLAN.md                     ✅ 완료
├── PRD.md                      ✅ 완료
├── README.md                   ✅ 완료
├── DEPLOY.md                   ✅ 완료
├── CLAUDE.md                   ✅ 완료
├── backend/
│   ├── api/
│   │   ├── fixtures/
│   │   │   └── initial_data.json  ✅ 완료
│   │   ├── models.py              ✅ 완료
│   │   ├── admin.py               ✅ 완료
│   │   ├── serializers.py         ✅ 완료
│   │   ├── services.py            ✅ 완료
│   │   ├── views.py               ✅ 완료
│   │   ├── urls.py                ✅ 완료
│   │   └── tests.py               ✅ 완료 (55 tests)
│   ├── config/
│   │   ├── settings.py            ✅ 완료
│   │   └── urls.py                ✅ 완료
│   ├── Dockerfile                 ✅ 완료
│   ├── start.sh                   ✅ 완료
│   └── requirements.txt           ✅ 완료
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js          ✅ 완료
    │   │   └── endpoints.js       ✅ 완료
    │   ├── contexts/
    │   │   ├── authContext.js     ✅ 완료
    │   │   └── AuthProvider.jsx   ✅ 완료
    │   ├── hooks/
    │   │   ├── useAuth.js         ✅ 완료
    │   │   ├── useTemplates.js    ✅ 완료
    │   │   ├── useBoards.js       ✅ 완료
    │   │   ├── useLeaderboard.js  ✅ 완료
    │   │   └── useKakaoMap.js     ✅ 완료
    │   ├── components/
    │   │   ├── Layout.jsx         ✅ 완료
    │   │   ├── bingo/             ✅ 완료
    │   │   ├── modals/            ✅ 완료
    │   │   ├── forms/             ✅ 완료
    │   │   ├── map/               ✅ 완료
    │   │   └── common/            ✅ 완료
    │   ├── pages/                 ✅ 완료 (8 pages)
    │   ├── router.jsx             ✅ 완료
    │   ├── main.jsx               ✅ 완료
    │   └── index.css              ✅ 완료
    ├── e2e-prod-test.cjs          ✅ 완료 (12 tests)
    ├── vercel.json                ✅ 완료
    └── package.json               ✅ 완료
```

---

## 진행 상황

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1 | ✅ 완료 | 2026-01-09 |
| Phase 2 | ✅ 완료 | 2026-01-09 |
| Phase 3 | ✅ 완료 | 2026-01-09 |
| Phase 4 | ✅ 완료 | 2026-01-09 |
| Phase 5 | ✅ 완료 | 2026-01-09 |
| Phase 6 | ✅ 완료 | 2026-01-09 |
| Phase 7 | ✅ 완료 | 2026-01-09 |
| Phase 8 | ✅ 완료 | 2026-01-09 |
| 인증 시스템 | ✅ 완료 | 2026-01-09 |
| 모바일 반응형 | ✅ 완료 | 2026-01-09 |
| 프로덕션 배포 | ✅ 완료 | 2026-01-10 |
| E2E 테스트 | ✅ 완료 | 2026-01-10 |
| Cloudinary 연동 | ✅ 완료 | 2026-01-10 |
