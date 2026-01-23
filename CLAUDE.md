# CLAUDE.md - Delicious Bingo 프로젝트 컨텍스트

> Claude Code가 이 프로젝트를 이해하고 작업하는 데 필요한 핵심 정보

## 프로젝트 개요

맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션.
- 사용자가 맛집 템플릿을 선택
- 실제 맛집을 방문하여 리뷰 작성
- 빙고 셀이 활성화되며, 목표 라인 수 달성 시 완료

### 배포 URL
- **Frontend**: https://delicious-bingo.vercel.app
- **Backend API**: https://delicious-bingo-production.up.railway.app

---

## 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Django | 6.0.1 | 웹 프레임워크 |
| Django REST Framework | 3.16 | REST API |
| Token Authentication | - | 인증 |
| SQLite / PostgreSQL | - | DB (개발/프로덕션) |
| Cloudinary | - | 이미지 저장소 (프로덕션) |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 라이브러리 |
| Vite | 7 | 빌드 도구 |
| Tailwind CSS | 4 | 스타일링 (@theme 디렉티브) |
| React Router | 7 | 라우팅 |
| TanStack Query | 5 | 서버 상태 관리 |
| Axios | - | HTTP 클라이언트 |
| Vitest | - | 유닛 테스트 |

---

## 디렉토리 구조

```
delicious_bingo/
├── backend/
│   ├── api/
│   │   ├── models.py              # 데이터 모델
│   │   ├── serializers.py         # DRF Serializers
│   │   ├── serializers_admin.py   # Admin Serializers
│   │   ├── views.py               # ViewSets + Auth APIs
│   │   ├── views_admin.py         # Admin ViewSets
│   │   ├── services.py            # BingoService (라인 감지)
│   │   ├── permissions.py         # IsAdminUser
│   │   ├── urls.py                # API 라우팅
│   │   ├── tests.py               # 87개 테스트
│   │   └── fixtures/initial_data.json
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── Dockerfile
│   ├── start.sh
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── admin/                 # 관리자 모듈
│   │   │   ├── api/               # Admin API 클라이언트
│   │   │   ├── components/        # AdminLayout, AdminGuard, KakaoPlaceSearch
│   │   │   ├── hooks/             # useKakaoSearch
│   │   │   └── pages/             # Dashboard, Restaurants, Templates, Categories, Users
│   │   ├── api/
│   │   │   ├── client.js          # Axios 인스턴스 (Token 인터셉터)
│   │   │   └── endpoints.js       # API 함수들
│   │   ├── components/
│   │   │   ├── bingo/             # BingoGrid, BingoCell, BingoHeader, CompletionCelebration
│   │   │   ├── common/            # ErrorBoundary, LoadingSpinner
│   │   │   ├── forms/             # ReviewForm
│   │   │   ├── map/               # KakaoMap
│   │   │   ├── modals/            # CellDetailModal
│   │   │   └── Layout.jsx
│   │   ├── contexts/              # AuthContext, AuthProvider
│   │   ├── hooks/                 # useAuth, useTemplates, useBoards, useLeaderboard, useKakaoMap
│   │   ├── pages/                 # 8개 페이지
│   │   ├── styles/
│   │   │   └── design-tokens.css  # 브랜드 컬러, 애니메이션
│   │   ├── utils/
│   │   │   └── cn.js              # 클래스네임 유틸리티
│   │   ├── constants/
│   │   │   └── confetti.js        # 컨페티 설정
│   │   ├── router.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── e2e-dev-test.cjs           # 17개 개발 E2E 테스트
│   ├── e2e-prod-test.cjs          # 15개 프로덕션 E2E 테스트
│   └── package.json
│
├── HISTORY.md                     # 개발 히스토리
├── PRD.md                         # 제품 요구사항
├── DEPLOY.md                      # 배포 가이드
├── TROUBLESHOOTING.md             # 배포 트러블슈팅
└── README.md                      # 프로젝트 문서
```

---

## 데이터 모델

```
Category (1) ──< Restaurant (N) ──< BingoTemplateItem (N) >── BingoTemplate (1)
                                                                    │
                                                                    v
User (1) ──< BingoBoard (N) ──< Review (N) >── Restaurant
```

| 모델 | 설명 |
|------|------|
| Category | 맛집 카테고리 |
| Restaurant | 맛집 정보 (이름, 주소, 좌표) |
| BingoTemplate | 5x5 빙고 템플릿 (25개 맛집) |
| BingoTemplateItem | 템플릿-맛집 연결 (position 0-24) |
| BingoBoard | 사용자의 빙고판 (target_line_count: 1/3/5) |
| Review | 맛집 리뷰 (이미지, 평점, 내용) → 셀 활성화 |

---

## API 엔드포인트

### Public API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/categories/` | 카테고리 목록 |
| GET | `/api/templates/` | 템플릿 목록 |
| GET | `/api/templates/:id/` | 템플릿 상세 |
| GET | `/api/leaderboard/` | 리더보드 |

### Auth API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register/` | 회원가입 |
| POST | `/api/auth/login/` | 로그인 |
| POST | `/api/auth/logout/` | 로그아웃 |
| GET | `/api/auth/me/` | 현재 사용자 |
| GET/PATCH | `/api/auth/profile/` | 프로필 조회/수정 |

### Protected API (인증 필요)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/boards/` | 내 빙고판 목록 |
| POST | `/api/boards/` | 빙고판 생성 |
| GET | `/api/boards/:id/` | 빙고판 상세 |
| DELETE | `/api/boards/:id/` | 빙고판 삭제 |
| POST | `/api/reviews/` | 리뷰 생성 |

### Admin API (Staff 권한)
| Method | Endpoint | 설명 |
|--------|----------|------|
| CRUD | `/api/admin/restaurants/` | 식당 관리 |
| CRUD | `/api/admin/templates/` | 템플릿 관리 |
| CRUD | `/api/admin/categories/` | 카테고리 관리 |
| GET/PATCH | `/api/admin/users/` | 사용자 관리 |
| GET | `/api/admin/kakao/search/` | 카카오 장소 검색 |

---

## 빙고 라인 규칙

12개 라인 (가로 5, 세로 5, 대각선 2):
```javascript
WINNING_LINES = [
  [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],  // 가로
  [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],  // 세로
  [0,6,12,18,24], [4,8,12,16,20]  // 대각선
]
```

---

## 브랜드 컬러 (UI)

| 컬러명 | HEX | 용도 |
|--------|-----|------|
| `brand-orange` | #FF8A00 | 메인 포인트 (버튼, 활성 셀) |
| `brand-beige` | #FFF9F0 | 서브 배경 |
| `brand-charcoal` | #1A1A1A | 텍스트 |
| `brand-gold` | #FFD700 | 별점, 컨페티 |
| `cell-inactive` | #F5F3F0 | 비활성 셀 |

Tailwind CSS 4의 `@theme` 디렉티브로 `design-tokens.css`에서 정의.

---

## 개발 환경 실행

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend
cd frontend
npm run dev

# 샘플 데이터 생성 (최초 1회)
cd backend && python manage.py seed_data
```

---

## 테스트 계정

| 역할 | Username | Password |
|------|----------|----------|
| 일반 사용자 | testuser | testpass123 |
| 관리자 | admin | admin1234 |

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

---

## 테스트 실행

```bash
# Backend (87개)
cd backend && python manage.py test

# Frontend (59개)
cd frontend && npm run test:run

# E2E 개발 (17개) - 로컬 서버 실행 필요
cd frontend && npm run e2e

# E2E 프로덕션 (15개)
cd frontend && npm run e2e:prod
```

---

## 환경 변수

### Backend (Railway)
```bash
SECRET_KEY=<Django secret key>
DEBUG=False
ALLOWED_HOSTS=<domain>
DATABASE_URL=<PostgreSQL URL>
CORS_ALLOWED_ORIGINS=<frontend URL>
CLOUDINARY_URL=<Cloudinary URL>
KAKAO_REST_API_KEY=<카카오 REST API 키>
```

### Frontend (Vercel)
```bash
VITE_API_URL=<backend URL>
VITE_KAKAO_JS_KEY=<카카오 JavaScript 키>
```

---

## 배포 아키텍처

| 서비스 | 플랫폼 | 설정 파일 |
|--------|--------|----------|
| Backend | Railway (Docker) | `Dockerfile`, `start.sh` |
| Frontend | Vercel | `vercel.json` |
| Database | Railway PostgreSQL | - |
| Images | Cloudinary | - |

자세한 배포 가이드는 `DEPLOY.md` 참조.

---

## TDD 개발 원칙

### Red-Green-Refactor 사이클

1. **Red**: 실패하는 테스트 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 테스트 통과 상태에서 코드 품질 개선

### 테스트 작성 가이드

| 상황 | 필요한 테스트 |
|------|--------------|
| API 응답 변경 | Serializer 필드 검증 테스트 |
| 비즈니스 로직 | Service 레이어 단위 테스트 |
| API 엔드포인트 | API 통합 테스트 |
| 프론트엔드 컴포넌트 | 렌더링/인터랙션 테스트 |
| 버그 수정 | 버그 재현 테스트 (regression) |

---

## 배포 워크플로우

```
1. 유닛 테스트 실행
   ├── Backend:  python manage.py test
   └── Frontend: npm run test:run

2. E2E 개발 테스트 (로컬 서버 실행 상태)
   └── npm run e2e

3. 커밋 & 푸시
   └── git push origin master → 자동 배포

4. E2E 프로덕션 테스트 (배포 후 1-2분 대기)
   └── npm run e2e:prod
```

**주의**: 테스트 실패 시 푸시 금지

---

## 관리자 페이지

### 접근 방법
1. `is_staff=True` 계정으로 로그인
2. `/admin` 경로 접근

### 페이지 구성
| 페이지 | 경로 | 기능 |
|--------|------|------|
| 대시보드 | `/admin` | 통계 카드 |
| 식당 관리 | `/admin/restaurants` | CRUD + 카카오 검색 |
| 템플릿 관리 | `/admin/templates` | 5x5 그리드 빌더 |
| 카테고리 관리 | `/admin/categories` | 인라인 CRUD |
| 사용자 관리 | `/admin/users` | is_staff/is_active 토글 |

---

## 모바일 반응형

- **모바일 우선**: 기본 모바일 → `sm:` 데스크탑 확장
- **햄버거 메뉴**: `md:hidden` 버튼
- **바텀시트 모달**: `items-end sm:items-center`
- **반응형 그리드**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

## 코드 컨벤션

- **Backend**: Django/DRF 표준
- **Frontend**: ESLint (react-hooks, react-refresh)
- **커밋**: Co-Authored-By 포함
- **커밋 메시지**: `Feat:`, `Fix:`, `Docs:`, `Refactor:` 접두사

---

## 향후 개선 계획

- [ ] 소셜 로그인 연동 (카카오, 구글)
- [ ] 리뷰 좋아요/댓글 기능
- [ ] 맛집 검색 기능
- [ ] 템플릿 공유 기능
