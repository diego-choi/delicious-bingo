# CLAUDE.md - Delicious Bingo 프로젝트 컨텍스트

## 프로젝트 개요

맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션. 사용자가 맛집 템플릿을 선택하고, 실제 맛집을 방문하여 리뷰를 작성하면 빙고 셀이 활성화되며, 목표 라인 수를 달성하면 빙고 완료.

## 기술 스택

### Backend
- Django 6.0.1
- Django REST Framework 3.16
- Token Authentication (rest_framework.authtoken)
- SQLite (개발)
- Pillow (이미지 처리)

### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- React Router 7
- TanStack Query 5 (서버 상태 관리)
- Axios (HTTP 클라이언트)
- Vitest + Testing Library (테스트)

## 디렉토리 구조

```
delicious_bingo/
├── backend/
│   ├── api/
│   │   ├── models.py          # Category, Restaurant, BingoTemplate, BingoBoard, Review
│   │   ├── serializers.py     # DRF Serializers
│   │   ├── views.py           # ViewSets + Auth APIs + Leaderboard
│   │   ├── services.py        # BingoService (라인 감지 로직)
│   │   ├── urls.py            # API 라우팅
│   │   ├── admin.py           # Admin 설정
│   │   ├── tests.py           # 40개 테스트
│   │   └── management/commands/seed_data.py  # 샘플 데이터 생성
│   ├── config/
│   │   ├── settings.py        # Django 설정 (CORS, DRF, Auth)
│   │   └── urls.py
│   ├── venv/                  # Python 가상환경
│   ├── media/                 # 업로드된 이미지
│   └── db.sqlite3
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js      # Axios 인스턴스 (Token 인터셉터)
│   │   │   └── endpoints.js   # API 함수들
│   │   ├── components/
│   │   │   ├── bingo/         # BingoGrid, BingoCell, BingoHeader, CompletionCelebration
│   │   │   ├── common/        # ErrorBoundary, LoadingSpinner
│   │   │   ├── forms/         # ReviewForm
│   │   │   ├── map/           # KakaoMap
│   │   │   ├── modals/        # CellDetailModal
│   │   │   └── Layout.jsx
│   │   ├── contexts/
│   │   │   ├── authContext.js # AuthContext 정의
│   │   │   └── AuthProvider.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTemplates.js
│   │   │   ├── useBoards.js
│   │   │   ├── useLeaderboard.js
│   │   │   └── useKakaoMap.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── TemplateListPage.jsx
│   │   │   ├── TemplateDetailPage.jsx
│   │   │   ├── MyBoardsPage.jsx
│   │   │   ├── BoardPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── router.jsx
│   │   ├── main.jsx
│   │   └── index.css          # 커스텀 애니메이션
│   ├── package.json
│   └── vite.config.js
│
├── PLAN.md                    # 8단계 구현 계획
├── PRD.md                     # 제품 요구사항
└── README.md                  # 프로젝트 문서
```

## 데이터 모델

```
Category (1) ──< Restaurant (N) ──< BingoTemplateItem (N) >── BingoTemplate (1)
                                                                    │
                                                                    v
User (1) ──< BingoBoard (N) ──< Review (N) >── Restaurant
```

- **Category**: 맛집 카테고리 (강남 맛집, 홍대 카페 등)
- **Restaurant**: 맛집 정보 (이름, 주소, 좌표)
- **BingoTemplate**: 5x5 빙고 템플릿 (25개 맛집)
- **BingoTemplateItem**: 템플릿-맛집 연결 (position 0-24)
- **BingoBoard**: 사용자의 빙고판 (target_line_count: 1/3/5)
- **Review**: 맛집 리뷰 (이미지, 평점, 내용) → 셀 활성화

## API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/categories/` | 카테고리 목록 | - |
| GET | `/api/templates/` | 템플릿 목록 | - |
| GET | `/api/templates/:id/` | 템플릿 상세 (25개 셀) | - |
| GET | `/api/boards/` | 내 빙고판 목록 | 필요 |
| POST | `/api/boards/` | 빙고판 생성 | 필요 |
| GET | `/api/boards/:id/` | 빙고판 상세 | 필요 |
| POST | `/api/reviews/` | 리뷰 생성 → 셀 활성화 | 필요 |
| GET | `/api/leaderboard/` | 리더보드 | - |
| POST | `/api/auth/login/` | 로그인 (토큰 발급) | - |
| POST | `/api/auth/logout/` | 로그아웃 | 필요 |
| GET | `/api/auth/me/` | 현재 사용자 정보 | 필요 |

## 빙고 라인 규칙

12개 라인 (가로 5, 세로 5, 대각선 2):
```javascript
WINNING_LINES = [
  [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],  // 가로
  [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],  // 세로
  [0,6,12,18,24], [4,8,12,16,20]  // 대각선
]
```

## 구현 완료 상태

### Phase 1-8 완료

1. **Backend API 기초**: Serializers, Views, URLs
2. **Backend API 완성**: BingoBoard, Review, BingoService
3. **Frontend 인프라**: React Router, React Query, Axios
4. **핵심 게임 컴포넌트**: BingoGrid, BingoCell, BingoHeader
5. **리뷰 및 인터랙션**: ReviewForm, CellDetailModal
6. **카카오맵 연동**: KakaoMap, useKakaoMap
7. **리더보드**: Leaderboard API, LeaderboardPage, CompletionCelebration
8. **테스트 및 마무리**: Backend 40 tests, Frontend 30 tests

### 추가 구현

- **인증 시스템**: Token 인증, 로그인/로그아웃
- **샘플 데이터**: seed_data 커맨드 (3개 템플릿, 75개 맛집)
- **축하 모달**: 빙고 완료 시 컨페티 효과
- **빙고 라인 하이라이트**: 완료된 라인 시각적 표시

## 개발 환경 실행

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend
cd frontend
npm run dev

# 샘플 데이터 생성
python manage.py seed_data
```

## 테스트 계정

- Username: `testuser`
- Password: `testpass123`

## 테스트 실행

```bash
# Backend (40 tests)
cd backend && python manage.py test

# Frontend (25 tests)
cd frontend && npm run test:run

# Lint
cd frontend && npm run lint
```

## 주요 기술적 결정

1. **Token 인증**: DRF TokenAuthentication 사용
2. **상태 관리**: React Query로 서버 상태, Context로 인증 상태
3. **빙고 라인 감지**: 프론트엔드와 백엔드 양쪽에서 계산
4. **이미지 업로드**: multipart/form-data로 처리
5. **ESLint 규칙**: react-refresh, react-hooks 엄격 적용

## 해결된 이슈

- [x] **리뷰 후 보드 미갱신**: React Query 쿼리 키 타입 불일치 (`useParams()`는 string, API 응답은 number)
  - 해결: `String(data.bingo_board)`로 타입 일치
  - 테스트: `useBoards.test.jsx` 5개 테스트 추가
- [x] **리뷰 이미지 미표시**: 중첩 Serializer에 request context 미전달로 상대 URL 반환
  - 해결: `ReviewSerializer(review, context=self.context)` context 전달

## 알려진 이슈 / TODO

- [ ] 카카오맵 API 키 설정 필요 (`.env.local`에 `VITE_KAKAO_JS_KEY`)
- [ ] 프로덕션 배포 설정
- [ ] 회원가입 기능
- [ ] 소셜 로그인 연동
- [ ] 모바일 반응형 최적화

## 코드 컨벤션

- **Backend**: Django/DRF 표준
- **Frontend**: ESLint (react-hooks, react-refresh)
- **커밋**: Co-Authored-By 포함
- **테스트**: TDD 접근 (가능한 경우)
