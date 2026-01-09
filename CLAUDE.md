# CLAUDE.md - Delicious Bingo 프로젝트 컨텍스트

## 프로젝트 개요

맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션. 사용자가 맛집 템플릿을 선택하고, 실제 맛집을 방문하여 리뷰를 작성하면 빙고 셀이 활성화되며, 목표 라인 수를 달성하면 빙고 완료.

## 기술 스택

### Backend
- Django 6.0.1
- Django REST Framework 3.16
- Token Authentication (rest_framework.authtoken)
- SQLite (개발) / PostgreSQL (프로덕션)
- Pillow (이미지 처리)
- Cloudinary (프로덕션 이미지 저장소)

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
│   │   ├── serializers_admin.py # Admin API Serializers
│   │   ├── views.py           # ViewSets + Auth APIs + Leaderboard
│   │   ├── views_admin.py     # Admin ViewSets + 카카오 검색 프록시
│   │   ├── permissions.py     # IsAdminUser 권한 클래스
│   │   ├── services.py        # BingoService (라인 감지 로직)
│   │   ├── urls.py            # API 라우팅
│   │   ├── admin.py           # Django Admin 설정
│   │   ├── tests.py           # 87개 테스트
│   │   ├── fixtures/initial_data.json  # 프로덕션 초기 데이터
│   │   └── management/commands/seed_data.py  # 개발용 샘플 데이터
│   ├── config/
│   │   ├── settings.py        # Django 설정 (CORS, DRF, Auth)
│   │   └── urls.py
│   ├── Dockerfile             # Railway Docker 빌드
│   ├── start.sh               # 컨테이너 시작 스크립트
│   ├── requirements.txt       # Python 의존성
│   ├── venv/                  # Python 가상환경 (로컬)
│   ├── media/                 # 업로드된 이미지 (로컬)
│   └── db.sqlite3             # SQLite DB (로컬)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js      # Axios 인스턴스 (Token 인터셉터)
│   │   │   └── endpoints.js   # API 함수들
│   │   ├── admin/             # 관리자 페이지
│   │   │   ├── api/adminEndpoints.js  # Admin API 클라이언트
│   │   │   ├── components/    # AdminLayout, AdminGuard, KakaoPlaceSearch
│   │   │   ├── hooks/         # useKakaoSearch
│   │   │   └── pages/         # Dashboard, Restaurants, Templates, Categories
│   │   ├── components/
│   │   │   ├── bingo/         # BingoGrid, BingoCell, BingoHeader, CompletionCelebration
│   │   │   ├── common/        # ErrorBoundary, LoadingSpinner
│   │   │   ├── forms/         # ReviewForm
│   │   │   ├── map/           # KakaoMap
│   │   │   ├── modals/        # CellDetailModal
│   │   │   └── Layout.jsx
│   │   ├── contexts/
│   │   │   ├── authContext.js # AuthContext 정의
│   │   │   └── AuthProvider.jsx # isStaff 상태 포함
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTemplates.js
│   │   │   ├── useBoards.js
│   │   │   ├── useLeaderboard.js
│   │   │   └── useKakaoMap.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TemplateListPage.jsx
│   │   │   ├── TemplateDetailPage.jsx
│   │   │   ├── MyBoardsPage.jsx
│   │   │   ├── BoardPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── router.jsx
│   │   ├── main.jsx
│   │   └── index.css          # 커스텀 애니메이션
│   ├── e2e-prod-test.cjs  # E2E 프로덕션 테스트
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

### 사용자 API

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
| POST | `/api/auth/register/` | 회원가입 (토큰 발급) | - |
| POST | `/api/auth/login/` | 로그인 (토큰 발급, is_staff 포함) | - |
| POST | `/api/auth/logout/` | 로그아웃 | 필요 |
| GET | `/api/auth/me/` | 현재 사용자 정보 (is_staff 포함) | 필요 |

### 관리자 API (is_staff 필요)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET/POST | `/api/admin/restaurants/` | 식당 목록/생성 |
| GET/PATCH/DELETE | `/api/admin/restaurants/:id/` | 식당 조회/수정/삭제 |
| GET/POST | `/api/admin/templates/` | 템플릿 목록/생성 |
| GET/PATCH/DELETE | `/api/admin/templates/:id/` | 템플릿 조회/수정/삭제 |
| GET/POST | `/api/admin/categories/` | 카테고리 목록/생성 |
| GET/PATCH/DELETE | `/api/admin/categories/:id/` | 카테고리 조회/수정/삭제 |
| GET | `/api/admin/kakao/search/` | 카카오 장소 검색 프록시 |

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
8. **테스트 및 마무리**: Backend 55 tests, Frontend 25 tests

### 추가 구현

- **인증 시스템**: Token 인증, 로그인/로그아웃
- **샘플 데이터**: seed_data 커맨드 (3개 템플릿, 75개 맛집)
- **축하 모달**: 빙고 완료 시 컨페티 효과
- **빙고 라인 하이라이트**: 완료된 라인 시각적 표시
- **모바일 반응형**: 전체 컴포넌트 모바일 우선 디자인 적용
- **Cloudinary 연동**: 프로덕션 이미지 저장소 (Django 6.0 STORAGES 설정)
- **관리자 페이지**: 식당/템플릿/카테고리 관리, 카카오 검색 연동

## 관리자 페이지

### 접근 방법
1. `is_staff=True` 계정으로 로그인
2. `/admin` 경로로 접근

### 기능
| 페이지 | 경로 | 기능 |
|--------|------|------|
| 대시보드 | `/admin` | 통계 카드 (식당/템플릿/카테고리 수) |
| 식당 관리 | `/admin/restaurants` | 목록, 검색, 필터, 페이지네이션 |
| 식당 등록/수정 | `/admin/restaurants/new`, `/admin/restaurants/:id` | 카카오 검색으로 식당 정보 자동 입력 |
| 템플릿 관리 | `/admin/templates` | 목록, 활성화 토글 |
| 템플릿 등록/수정 | `/admin/templates/new`, `/admin/templates/:id` | 5x5 그리드 빌더 |
| 카테고리 관리 | `/admin/categories` | 인라인 CRUD |

### 카카오 검색 연동
- 식당 등록 시 카카오 장소 검색으로 정보 자동 입력
- 이름, 주소, 좌표, place_url이 자동으로 채워짐
- 백엔드 프록시 API로 CORS 문제 해결

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

### 일반 사용자
- Username: `testuser`
- Password: `testpass123`

### 관리자 (Staff)
- Username: `admin`
- Password: `admin1234`

관리자 계정 생성:
```bash
python manage.py shell -c "
from django.contrib.auth.models import User
user, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com'})
user.set_password('admin1234')
user.is_staff = True
user.save()
print('Admin account ready')
"
```

## 테스트 실행

```bash
# Backend (87 tests)
cd backend && source venv/bin/activate && python manage.py test

# Frontend (57 tests)
cd frontend && npm run test:run

# E2E 개발 환경 테스트 (17 tests)
cd frontend && npm run e2e

# E2E 프로덕션 테스트 (15 tests)
cd frontend && npm run e2e:prod

# Lint
cd frontend && npm run lint
```

## E2E 테스트

Playwright 기반 E2E 테스트. 개발 환경과 프로덕션 환경 모두 지원.

### 최초 설치
```bash
cd frontend
npm install -D playwright
npx playwright install chromium
```

### 개발 환경 E2E 테스트 (17개)

`frontend/e2e-dev-test.cjs` - 로컬 개발 서버 대상 테스트

```bash
# 사전 준비: 개발 서버 실행
# 터미널 1: cd backend && python manage.py runserver
# 터미널 2: cd frontend && npm run dev

npm run e2e              # headless 모드
npm run e2e:headed       # 브라우저 표시
npm run e2e:slow         # 디버깅용 느린 모드
```

**테스트 항목:**
1. 홈페이지 로딩
2. 템플릿 목록
3. 템플릿 상세
4. 로그인 폼
5. 테스트 계정 표시 (Dev)
6. 회원가입 페이지
7. 리더보드 페이지
8. API 연결
9. 테스트 계정 로그인
10. 내 빙고 페이지 (인증)
11. 프로필 페이지 (인증)
12. 빙고 도전 시작
13. 빙고 그리드 표시
14. 셀 클릭 모달
15. 관리자 페이지 접근
16. 모바일 반응형
17. 로그아웃

**특징:**
- 서버 실행 상태 자동 확인
- `--headed` 옵션으로 브라우저 화면 확인
- `--slow` 옵션으로 느린 모드 디버깅
- 환경변수로 URL 커스터마이징 (`E2E_BASE_URL`, `E2E_API_URL`)

### 프로덕션 E2E 테스트 (15개)

`frontend/e2e-prod-test.cjs` - 프로덕션 환경 테스트

```bash
npm run e2e:prod
```

**테스트 항목:**
- 홈페이지, 템플릿 목록/상세, 로그인/회원가입 페이지
- 테스트 계정 숨김 (Production), 리더보드, API 연결
- 회원가입/로그인 플로우, 프로필 페이지
- 보호된 라우트, 모바일 반응형

## 주요 기술적 결정

1. **Token 인증**: DRF TokenAuthentication 사용
2. **상태 관리**: React Query로 서버 상태, Context로 인증 상태
3. **빙고 라인 감지**: 프론트엔드와 백엔드 양쪽에서 계산
4. **이미지 업로드**: multipart/form-data로 처리
5. **ESLint 규칙**: react-refresh, react-hooks 엄격 적용

## TODO

- [x] 카카오맵 API 키 설정 (`.env.local`에 `VITE_KAKAO_JS_KEY`)
- [x] 관리자 페이지 구현 (식당/템플릿/카테고리 관리)
- [x] 카카오 장소 검색 연동
- [ ] 소셜 로그인 연동

## 프로덕션 배포

자세한 배포 가이드는 `DEPLOY.md` 참조.

### 배포 아키텍처
- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Django + Gunicorn + WhiteNoise)
- **Database**: Railway PostgreSQL

### 주요 설정 파일
| 파일 | 설명 |
|------|------|
| `backend/Dockerfile` | Railway Docker 빌드 설정 |
| `backend/start.sh` | 컨테이너 시작 스크립트 (마이그레이션 + gunicorn) |
| `backend/requirements.txt` | Python 의존성 (gunicorn, whitenoise, dj-database-url) |
| `backend/.env.example` | 환경 변수 예시 |
| `frontend/vercel.json` | Vercel SPA 라우팅 + 캐시 헤더 설정 |
| `frontend/.env.example` | 환경 변수 예시 |

### 환경 변수
```bash
# Backend (Railway)
SECRET_KEY, DEBUG, ALLOWED_HOSTS, DATABASE_URL, CORS_ALLOWED_ORIGINS, CLOUDINARY_URL, KAKAO_REST_API_KEY

# Frontend (Vercel)
VITE_API_URL, VITE_KAKAO_JS_KEY
```

### 카카오 API 키
| 용도 | 환경 변수 | 설정 위치 |
|------|----------|----------|
| 장소 검색 (Admin) | `KAKAO_REST_API_KEY` | Backend (Railway) |
| 지도 표시 | `VITE_KAKAO_JS_KEY` | Frontend (Vercel) |

카카오 개발자 콘솔에서 앱 생성 후:
- REST API 키 → 백엔드 환경변수
- JavaScript 키 → 프론트엔드 환경변수
- 플랫폼 등록: Web 사이트 도메인 추가 필요

### Cloudinary 설정
- **환경변수**: `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
- **개발 환경**: 로컬 파일시스템 (`/media/`)
- **프로덕션**: Cloudinary 클라우드 스토리지
- **Django 설정**: `STORAGES` (Django 5+ 방식, `DEFAULT_FILE_STORAGE` deprecated)

## 모바일 반응형 디자인

### 적용된 패턴

- **모바일 우선**: 기본 스타일은 모바일, `sm:` 브레이크포인트로 데스크탑 확장
- **반응형 텍스트**: `text-sm sm:text-base`, `text-xl sm:text-2xl` 등
- **반응형 간격**: `p-4 sm:p-6`, `gap-2 sm:gap-4`, `mb-4 sm:mb-6` 등
- **반응형 그리드**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### 변경된 컴포넌트

| 컴포넌트 | 변경 사항 |
|----------|-----------|
| `Layout.jsx` | 모바일 햄버거 메뉴, 드롭다운 네비게이션 |
| `BingoGrid.jsx` | 반응형 패딩/간격 (`p-2 sm:p-4`, `gap-1 sm:gap-2`) |
| `BingoCell.jsx` | 셀 크기/텍스트 (`text-[10px] sm:text-xs`) |
| `BingoHeader.jsx` | 통계 카드, 진행률 바 크기 조정 |
| `CellDetailModal.jsx` | 모바일: 바텀시트, 데스크탑: 중앙 모달 |
| `CompletionCelebration.jsx` | 패딩/버튼 크기 조정 |
| `HomePage.jsx` | 히어로 섹션, 카드 그리드, 사용방법 |
| `LeaderboardPage.jsx` | 탭 버튼, 랭킹 리스트 |
| `TemplateListPage.jsx` | 템플릿 카드 그리드 |
| `TemplateDetailPage.jsx` | 맛집 미리보기 그리드, 도전 버튼 |
| `MyBoardsPage.jsx` | 보드 카드 리스트 |
| `LoginPage.jsx` | 폼 패딩/텍스트 |
| `RegisterPage.jsx` | 폼 레이아웃 |
| `BoardPage.jsx` | 페이지 간격 |

### 모바일 특화 UI

- **햄버거 메뉴**: `md:hidden` 버튼, 드롭다운 네비게이션
- **바텀시트 모달**: `items-end sm:items-center` + `rounded-t-xl sm:rounded-xl`
- **터치 친화적**: 버튼/입력 필드 충분한 터치 영역 확보

## 코드 컨벤션

- **Backend**: Django/DRF 표준
- **Frontend**: ESLint (react-hooks, react-refresh)
- **커밋**: Co-Authored-By 포함

## TDD 개발 원칙 (필수)

이 프로젝트는 Kent Beck의 TDD(Test-Driven Development) 및 Tidy First 원칙을 따릅니다.

### Red-Green-Refactor 사이클

코드 변경 시 반드시 다음 순서를 따릅니다:

1. **Red (실패하는 테스트 작성)**
   - 새 기능 또는 버그 수정 전에 먼저 테스트를 작성
   - 테스트가 실패하는 것을 확인 (아직 구현되지 않았으므로)
   - 테스트는 원하는 동작을 명확히 정의해야 함

2. **Green (최소한의 코드로 테스트 통과)**
   - 테스트를 통과시키는 가장 간단한 코드 작성
   - 완벽한 코드가 아니어도 됨, 테스트만 통과하면 됨
   - 과도한 설계나 최적화 금지

3. **Refactor (코드 정리)**
   - 테스트가 통과한 상태에서 코드 품질 개선
   - 중복 제거, 명확한 네이밍, 구조 개선
   - 리팩토링 후에도 모든 테스트가 통과해야 함

### 실제 적용 예시

```
# 버그 수정 시
1. 버그를 재현하는 테스트 작성 (실패 확인)
2. 버그 수정 코드 작성 (테스트 통과)
3. 필요시 코드 정리

# 새 기능 추가 시
1. 새 기능의 예상 동작을 테스트로 작성 (실패 확인)
2. 기능 구현 (테스트 통과)
3. 코드 정리 및 리팩토링
```

### Tidy First 원칙

구조적 변경이 필요할 때:

1. **먼저 정리(Tidy)**: 동작 변경 전에 구조를 먼저 정리
2. **작은 단위로**: 큰 변경을 작은 단계로 분리
3. **분리된 커밋**: 정리와 동작 변경을 별도 커밋으로 분리

```
# 잘못된 예
한 커밋에서 리팩토링 + 새 기능 + 버그 수정

# 올바른 예
커밋 1: Refactor - 함수 추출로 가독성 개선
커밋 2: Fix - 버그 수정 (테스트 포함)
커밋 3: Feat - 새 기능 추가 (테스트 포함)
```

### 테스트 작성 가이드

| 상황 | 필요한 테스트 |
|------|--------------|
| API 응답 필드 변경 | Serializer 필드 검증 테스트 |
| 비즈니스 로직 변경 | Service 레이어 단위 테스트 |
| API 엔드포인트 변경 | API 통합 테스트 |
| 프론트엔드 컴포넌트 | 렌더링 및 인터랙션 테스트 |
| 버그 수정 | 버그 재현 테스트 (regression test) |

### 테스트 없이 코드 변경 금지

다음 경우에도 테스트가 필요합니다:
- "간단한" 버그 수정
- Serializer 필드 추가/제거
- API 응답 구조 변경
- 유틸리티 함수 수정

테스트 없이 변경하면 나중에 regression이 발생해도 감지할 수 없습니다.
