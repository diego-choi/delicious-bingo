# Delicious Bingo 구현 계획

## 현재 상태
- [x] Django 프로젝트 초기화
- [x] Django 모델 정의 (Category, Restaurant, BingoTemplate, BingoTemplateItem, BingoBoard, Review)
- [x] Django Admin 설정
- [x] Django 설정 구성 (CORS, DRF)
- [x] React + Vite 프로젝트 초기화
- [x] Tailwind CSS 설정

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

## Phase 3: 프론트엔드 인프라 (라우팅, API 클라이언트, 상태 관리)

### TODO
- [ ] 패키지 설치
  ```bash
  npm install react-router-dom axios @tanstack/react-query
  ```
- [ ] `frontend/src/api/client.js` 생성
  - [ ] Axios 인스턴스 설정
  - [ ] 인증 토큰 인터셉터
- [ ] `frontend/src/api/endpoints.js` 생성
  - [ ] templatesApi (getAll, getById)
  - [ ] boardsApi (getAll, getById, create)
  - [ ] reviewsApi (create)
- [ ] `frontend/src/hooks/useTemplates.js` 생성
  - [ ] useTemplates()
  - [ ] useTemplate(id)
- [ ] `frontend/src/hooks/useBoards.js` 생성
  - [ ] useBoards()
  - [ ] useBoard(id)
  - [ ] useCreateBoard()
  - [ ] useCreateReview()
- [ ] `frontend/src/router.jsx` 생성
  - [ ] 라우트 정의 (/, /templates, /templates/:id, /boards, /boards/:id, /leaderboard)
- [ ] `frontend/src/components/Layout.jsx` 생성
  - [ ] 헤더 네비게이션
  - [ ] Outlet 구성
- [ ] `frontend/src/main.jsx` 수정
  - [ ] QueryClientProvider 추가
  - [ ] RouterProvider 추가
- [ ] 페이지 플레이스홀더 생성
  - [ ] `frontend/src/pages/HomePage.jsx`
  - [ ] `frontend/src/pages/TemplateListPage.jsx`
  - [ ] `frontend/src/pages/TemplateDetailPage.jsx`
  - [ ] `frontend/src/pages/BoardPage.jsx`
  - [ ] `frontend/src/pages/MyBoardsPage.jsx`
  - [ ] `frontend/src/pages/LeaderboardPage.jsx`

### 검증
- [ ] 모든 라우트 접근 확인
- [ ] API 클라이언트 연결 확인
- [ ] React Query 캐싱 동작 확인

---

## Phase 4: 핵심 게임 컴포넌트 (BingoGrid, BingoCell)

### TODO
- [ ] `frontend/src/components/bingo/BingoGrid.jsx` 생성
  - [ ] 5x5 그리드 레이아웃 (grid-cols-5)
  - [ ] 완료 라인 하이라이트 로직
  - [ ] onCellClick 핸들러
- [ ] `frontend/src/components/bingo/BingoCell.jsx` 생성
  - [ ] 비활성화 상태 UI (흰 배경)
  - [ ] 활성화 상태 UI (녹색 + 체크마크)
  - [ ] 하이라이트 상태 (빙고 라인)
  - [ ] 호버 효과
- [ ] `frontend/src/components/bingo/BingoHeader.jsx` 생성
  - [ ] 템플릿 제목 표시
  - [ ] 목표 라인 / 완료 라인 표시
  - [ ] 진행률 바
  - [ ] 빙고 완료 배지
- [ ] `frontend/src/pages/BoardPage.jsx` 구현
  - [ ] useBoard 훅 연동
  - [ ] BingoHeader, BingoGrid 통합
  - [ ] 셀 클릭 시 모달 열기

### 검증
- [ ] 5x5 그리드 정상 렌더링
- [ ] 활성화된 셀 녹색 표시
- [ ] 진행률 바 업데이트
- [ ] 셀 클릭 이벤트 동작

---

## Phase 5: 리뷰 및 인터랙션 (ReviewModal, 폼 처리)

### TODO
- [ ] `frontend/src/components/modals/CellDetailModal.jsx` 생성
  - [ ] 맛집 정보 표시 (이름, 주소, 카카오맵 링크)
  - [ ] 지도 영역 플레이스홀더
  - [ ] 기존 리뷰 표시 (활성화된 경우)
  - [ ] 리뷰 작성 버튼 / 폼 토글
- [ ] `frontend/src/components/forms/ReviewForm.jsx` 생성
  - [ ] 이미지 업로드 (필수, 미리보기)
  - [ ] 별점 선택 (1-5)
  - [ ] 리뷰 내용 (최소 10자 검증)
  - [ ] 방문일 선택
  - [ ] 공개 여부 토글
  - [ ] 폼 제출 및 에러 처리
- [ ] `frontend/src/pages/TemplateDetailPage.jsx` 구현
  - [ ] 템플릿 정보 표시
  - [ ] 25개 맛집 미리보기
  - [ ] 목표 라인 선택 (1, 3, 5)
  - [ ] 도전 시작 버튼
- [ ] `frontend/src/pages/TemplateListPage.jsx` 구현
  - [ ] 템플릿 카드 목록
  - [ ] 카테고리 필터 (선택)

### 검증
- [ ] 리뷰 폼 검증 동작 (이미지, 10자)
- [ ] 리뷰 제출 후 셀 활성화
- [ ] 도전 시작 → 보드 생성 → 리다이렉트

---

## Phase 6: 카카오맵 연동

### TODO
- [ ] `frontend/.env.local` 생성
  ```
  VITE_API_URL=http://localhost:8000/api
  VITE_KAKAO_JS_KEY=your_kakao_javascript_key
  ```
- [ ] `frontend/src/components/map/KakaoMap.jsx` 생성
  - [ ] Kakao Maps SDK 동적 로딩
  - [ ] 지도 초기화 (위도/경도 기반)
  - [ ] 마커 표시
  - [ ] 인포윈도우 (맛집명)
- [ ] `frontend/src/components/modals/CellDetailModal.jsx` 수정
  - [ ] KakaoMap 컴포넌트 통합
- [ ] `frontend/index.html` 수정 (선택)
  - [ ] Kakao SDK 프리로드

### 검증
- [ ] 지도 정상 렌더링
- [ ] 마커 위치 정확성
- [ ] 인포윈도우 표시

---

## Phase 7: 리더보드 및 완료 기능

### TODO
- [ ] `backend/api/views.py` 추가
  - [ ] leaderboard() 함수 뷰
  - [ ] 최단 시간 클리어 쿼리
  - [ ] 총 완료 횟수 쿼리
- [ ] `backend/api/urls.py` 수정
  - [ ] `/api/leaderboard/` 경로 추가
- [ ] `frontend/src/api/endpoints.js` 수정
  - [ ] leaderboardApi 추가
- [ ] `frontend/src/hooks/useLeaderboard.js` 생성
  - [ ] useLeaderboard(templateId)
- [ ] `frontend/src/pages/LeaderboardPage.jsx` 구현
  - [ ] 템플릿 필터 드롭다운
  - [ ] 최단 시간 클리어 순위표
  - [ ] 총 완료 횟수 순위표
  - [ ] 순위별 스타일링 (금/은/동)
- [ ] `frontend/src/components/bingo/CompletionCelebration.jsx` 생성
  - [ ] 축하 모달 UI
  - [ ] 클리어 시간 표시
  - [ ] 애니메이션 효과
- [ ] `frontend/src/pages/BoardPage.jsx` 수정
  - [ ] 빙고 완료 시 축하 모달 표시

### 검증
- [ ] 리더보드 데이터 정상 로드
- [ ] 템플릿 필터 동작
- [ ] 빙고 완료 시 축하 모달 표시

---

## Phase 8: 테스트 및 마무리

### TODO
- [ ] 백엔드 테스트 (`backend/api/tests.py`)
  - [ ] BingoService 가로 라인 감지 테스트
  - [ ] BingoService 세로 라인 감지 테스트
  - [ ] BingoService 대각선 라인 감지 테스트
  - [ ] API 인증 테스트
  - [ ] 리뷰 생성 → 빙고 완료 통합 테스트
- [ ] 프론트엔드 테스트
  - [ ] 테스트 패키지 설치
    ```bash
    npm install -D vitest @testing-library/react @testing-library/jest-dom
    ```
  - [ ] BingoCell 컴포넌트 테스트
  - [ ] ReviewForm 검증 테스트
- [ ] 공통 컴포넌트 생성
  - [ ] `frontend/src/components/common/ErrorBoundary.jsx`
  - [ ] `frontend/src/components/common/LoadingSpinner.jsx`
- [ ] `frontend/src/index.css` 수정
  - [ ] bounce-in 애니메이션
  - [ ] pulse-line 애니메이션
- [ ] `frontend/src/main.jsx` 수정
  - [ ] ErrorBoundary 래핑

### 검증
- [ ] `python manage.py test` 통과
- [ ] `npm test` 통과
- [ ] `npm run build` 성공
- [ ] E2E 시나리오 수동 테스트

---

## E2E 테스트 체크리스트

- [ ] 템플릿 목록 조회
- [ ] 템플릿 상세 보기
- [ ] 목표 라인 설정 후 도전 시작
- [ ] 빙고 보드 5x5 그리드 표시
- [ ] 셀 클릭 → 맛집 상세 모달
- [ ] 카카오맵 맛집 위치 표시
- [ ] 리뷰 작성 (이미지, 내용, 평점)
- [ ] 리뷰 제출 → 셀 활성화
- [ ] 빙고 라인 완성 감지
- [ ] 목표 달성 → 축하 모달
- [ ] 리더보드 순위 확인

---

## 파일 구조 (최종)

```
delicious_bingo/
├── PLAN.md
├── PRD.md
├── backend/
│   ├── api/
│   │   ├── models.py        ✅ 완료
│   │   ├── admin.py         ✅ 완료
│   │   ├── serializers.py   ✅ Phase 1-2 완료
│   │   ├── services.py      ✅ Phase 2 완료
│   │   ├── views.py         ✅ Phase 1-2 완료 (Phase 7 추가 예정)
│   │   ├── urls.py          ✅ Phase 1-2 완료 (Phase 7 추가 예정)
│   │   └── tests.py         ✅ Phase 1-2 완료 (Phase 8 추가 예정)
│   ├── config/
│   │   ├── settings.py      ✅ 완료
│   │   └── urls.py          ✅ Phase 1 완료
│   └── requirements.txt     ✅ 완료
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js    📋 Phase 3
    │   │   └── endpoints.js 📋 Phase 3, 7
    │   ├── hooks/
    │   │   ├── useTemplates.js  📋 Phase 3
    │   │   ├── useBoards.js     📋 Phase 3
    │   │   └── useLeaderboard.js 📋 Phase 7
    │   ├── components/
    │   │   ├── Layout.jsx           📋 Phase 3
    │   │   ├── bingo/
    │   │   │   ├── BingoGrid.jsx    📋 Phase 4
    │   │   │   ├── BingoCell.jsx    📋 Phase 4
    │   │   │   ├── BingoHeader.jsx  📋 Phase 4
    │   │   │   └── CompletionCelebration.jsx 📋 Phase 7
    │   │   ├── modals/
    │   │   │   └── CellDetailModal.jsx 📋 Phase 5-6
    │   │   ├── forms/
    │   │   │   └── ReviewForm.jsx   📋 Phase 5
    │   │   ├── map/
    │   │   │   └── KakaoMap.jsx     📋 Phase 6
    │   │   └── common/
    │   │       ├── ErrorBoundary.jsx 📋 Phase 8
    │   │       └── LoadingSpinner.jsx 📋 Phase 8
    │   ├── pages/
    │   │   ├── HomePage.jsx         📋 Phase 3
    │   │   ├── TemplateListPage.jsx 📋 Phase 3, 5
    │   │   ├── TemplateDetailPage.jsx 📋 Phase 3, 5
    │   │   ├── BoardPage.jsx        📋 Phase 3-5, 7
    │   │   ├── MyBoardsPage.jsx     📋 Phase 3
    │   │   └── LeaderboardPage.jsx  📋 Phase 3, 7
    │   ├── router.jsx       📋 Phase 3
    │   ├── main.jsx         📋 Phase 3, 8
    │   ├── App.jsx          ✅ 완료
    │   └── index.css        📋 Phase 8
    ├── .env.local           📋 Phase 6
    ├── index.html           📋 Phase 6
    └── package.json         ✅ 완료
```

---

## 진행 상황

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1 | ✅ 완료 | 2026-01-09 |
| Phase 2 | ✅ 완료 | 2026-01-09 |
| Phase 3 | ⬜ 대기 | - |
| Phase 4 | ⬜ 대기 | - |
| Phase 5 | ⬜ 대기 | - |
| Phase 6 | ⬜ 대기 | - |
| Phase 7 | ⬜ 대기 | - |
| Phase 8 | ⬜ 대기 | - |
