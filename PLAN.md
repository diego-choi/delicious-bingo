# Delicious Bingo 개발 히스토리

> 맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션

## 프로젝트 상태

| 항목 | 상태 |
|------|------|
| **개발 완료** | ✅ 모든 기능 구현 완료 |
| **프로덕션 배포** | ✅ Railway + Vercel |
| **테스트** | ✅ Backend 87개 / Frontend 59개 / E2E 32개 |

### 배포 URL
- **Frontend**: https://delicious-bingo.vercel.app
- **Backend API**: https://delicious-bingo-production.up.railway.app

---

## 구현 완료 기능 요약

| 기능 | 설명 | 완료일 |
|------|------|--------|
| REST API 기초 | 카테고리, 템플릿 API | 2026-01-09 |
| 빙고 게임 로직 | 보드 생성, 리뷰, 라인 감지 | 2026-01-09 |
| React 프론트엔드 | 라우팅, 상태 관리, API 연동 | 2026-01-09 |
| 빙고 UI 컴포넌트 | 5x5 그리드, 셀, 진행률 | 2026-01-09 |
| 리뷰 시스템 | 이미지 업로드, 별점, 모달 | 2026-01-09 |
| 카카오맵 연동 | 맛집 위치 지도 표시 | 2026-01-09 |
| 리더보드 | 최단 시간/최다 완료 순위 | 2026-01-09 |
| 인증 시스템 | 회원가입, 로그인, 토큰 | 2026-01-09 |
| 모바일 반응형 | 햄버거 메뉴, 바텀시트 | 2026-01-09 |
| 프로덕션 배포 | Railway + Vercel | 2026-01-10 |
| E2E 테스트 | 개발/프로덕션 환경 | 2026-01-10 |
| Cloudinary 연동 | 클라우드 이미지 저장소 | 2026-01-10 |
| 관리자 페이지 | 식당/템플릿/카테고리 관리 | 2026-01-10 |
| UI 전면 개편 | 캐치테이블 스타일 + Vibrant Orange | 2026-01-23 |

---

## 1. REST API 기초 ✅

카테고리와 빙고 템플릿 조회를 위한 기본 API 구축.

### 구현 내용
- `CategorySerializer`, `RestaurantSerializer` 생성
- `BingoTemplateListSerializer`, `BingoTemplateDetailSerializer` 생성
- `CategoryViewSet`, `BingoTemplateViewSet` (ReadOnly)
- DefaultRouter 설정 및 `/api/` 경로 연결

### API 엔드포인트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/categories/` | 카테고리 목록 |
| GET | `/api/templates/` | 템플릿 목록 |
| GET | `/api/templates/:id/` | 템플릿 상세 (25개 셀 포함) |

---

## 2. 빙고 게임 로직 ✅

빙고 보드 생성, 리뷰 작성, 라인 감지 등 핵심 게임 로직 구현.

### 구현 내용
- `BingoService` 클래스: 라인 감지 알고리즘
- `WINNING_LINES` 상수: 12개 빙고 라인 (가로 5, 세로 5, 대각선 2)
- `ReviewSerializer`, `BingoBoardSerializer` 생성
- 리뷰 생성 시 자동 셀 활성화 및 빙고 완료 체크

### 빙고 라인 규칙
```
가로: [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24]
세로: [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24]
대각선: [0,6,12,18,24], [4,8,12,16,20]
```

### API 엔드포인트
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/boards/` | 내 빙고판 목록 | 필요 |
| POST | `/api/boards/` | 빙고판 생성 | 필요 |
| GET | `/api/boards/:id/` | 빙고판 상세 | 필요 |
| POST | `/api/reviews/` | 리뷰 생성 → 셀 활성화 | 필요 |

---

## 3. React 프론트엔드 인프라 ✅

React Router, TanStack Query, Axios 기반 프론트엔드 아키텍처 구축.

### 기술 스택
- **라우팅**: React Router 7
- **상태 관리**: TanStack Query 5 (서버 상태)
- **HTTP 클라이언트**: Axios (토큰 인터셉터)

### 구현 내용
- `api/client.js`: Axios 인스턴스 + 인증 토큰 인터셉터
- `api/endpoints.js`: templatesApi, boardsApi, reviewsApi
- `hooks/useTemplates.js`, `hooks/useBoards.js`: React Query 훅
- `router.jsx`: 전체 라우트 설정
- `components/Layout.jsx`: 공통 레이아웃 (햄버거 메뉴 포함)

---

## 4. 빙고 UI 컴포넌트 ✅

5x5 빙고 그리드와 셀 컴포넌트 구현.

### 컴포넌트 구조
```
components/bingo/
├── BingoGrid.jsx      # 5x5 그리드 레이아웃
├── BingoCell.jsx      # 개별 셀 (활성/비활성/하이라이트)
├── BingoHeader.jsx    # 진행률 바, 통계
└── CompletionCelebration.jsx  # 빙고 완료 축하 모달
```

### 셀 상태
| 상태 | 스타일 |
|------|--------|
| 비활성 | `bg-cell-inactive` 베이지-그레이 |
| 활성 (이미지 없음) | `bg-brand-orange` 오렌지 + 체크 |
| 활성 (이미지 있음) | 리뷰 이미지 + 오렌지 오버레이 |
| 빙고 라인 | `ring-2 ring-brand-orange` 하이라이트 |

---

## 5. 리뷰 시스템 ✅

맛집 리뷰 작성 폼과 상세 모달 구현.

### 구현 내용
- `CellDetailModal.jsx`: 맛집 정보 + 리뷰 표시 + 모바일 바텀시트
- `ReviewForm.jsx`: 이미지 업로드, 별점(1-5), 리뷰 내용, 방문일

### 리뷰 폼 검증
| 필드 | 검증 규칙 |
|------|----------|
| 이미지 | 필수, 미리보기 제공 |
| 별점 | 1-5점 필수 선택 |
| 리뷰 내용 | 최소 10자 |
| 방문일 | 필수 선택 |

---

## 6. 카카오맵 연동 ✅

맛집 위치를 카카오맵에 표시.

### 구현 내용
- `components/map/KakaoMap.jsx`: 지도 컴포넌트
- `hooks/useKakaoMap.js`: 카카오 SDK 로딩 훅
- CellDetailModal에 지도 통합

### 환경변수
```bash
VITE_KAKAO_JS_KEY=<JavaScript 키>  # Frontend
KAKAO_REST_API_KEY=<REST API 키>   # Backend (관리자 검색용)
```

---

## 7. 리더보드 ✅

빙고 완료 기록 순위 시스템.

### 구현 내용
- `GET /api/leaderboard/`: 리더보드 API
- `LeaderboardPage.jsx`: 탭 UI (최단 시간 / 최다 완료)
- `CompletionCelebration.jsx`: CSS 컨페티 애니메이션

### 리더보드 카테고리
| 카테고리 | 정렬 기준 |
|----------|----------|
| 최단 시간 클리어 | 빙고 완료 소요 시간 |
| 최다 완료 | 완료한 빙고 수 |

---

## 8. 인증 시스템 ✅

Token 기반 회원가입/로그인 시스템.

### 구현 내용
- DRF TokenAuthentication 설정
- `AuthContext` + `AuthProvider`: 인증 상태 관리
- `LoginPage.jsx`, `RegisterPage.jsx`: 인증 UI

### API 엔드포인트
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register/` | 회원가입 (토큰 발급) |
| POST | `/api/auth/login/` | 로그인 (토큰 발급, is_staff 포함) |
| POST | `/api/auth/logout/` | 로그아웃 |
| GET | `/api/auth/me/` | 현재 사용자 정보 |

### 테스트 계정
| 역할 | Username | Password |
|------|----------|----------|
| 일반 사용자 | testuser | testpass123 |
| 관리자 | admin | admin1234 |

---

## 9. 모바일 반응형 ✅

모바일 우선(Mobile-First) 반응형 디자인 적용.

### 적용 패턴
- 기본: 모바일 스타일 → `sm:` 브레이크포인트로 데스크탑 확장
- 햄버거 메뉴 네비게이션 (`md:hidden`)
- 바텀시트 모달 (`items-end sm:items-center`)
- 반응형 그리드/텍스트/간격

### 변경된 컴포넌트
| 컴포넌트 | 모바일 대응 |
|----------|------------|
| Layout | 햄버거 메뉴, 드롭다운 네비게이션 |
| CellDetailModal | 바텀시트 UI |
| BingoGrid | `gap-1 sm:gap-2` |
| BingoCell | `text-[10px] sm:text-xs` |

---

## 10. 프로덕션 배포 ✅

Railway(Backend) + Vercel(Frontend) 배포 구성.

### Backend (Railway)
- Docker 컨테이너 배포 (`Dockerfile` + `start.sh`)
- PostgreSQL 데이터베이스
- WhiteNoise 정적 파일 서빙
- 환경변수: `SECRET_KEY`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`

### Frontend (Vercel)
- Vite 빌드 자동 배포
- SPA 라우팅 설정 (`vercel.json`)
- stale-while-revalidate 캐시 전략
- 환경변수: `VITE_API_URL`, `VITE_KAKAO_JS_KEY`

---

## 11. E2E 테스트 ✅

Playwright 기반 End-to-End 테스트.

### 개발 환경 테스트 (17개)
```bash
npm run e2e          # headless 모드
npm run e2e:headed   # 브라우저 표시
npm run e2e:slow     # 디버깅용 느린 모드
```

### 프로덕션 테스트 (15개)
```bash
npm run e2e:prod
```

### 테스트 항목
- 홈페이지, 템플릿 목록/상세
- 로그인/회원가입 플로우
- 빙고 도전 시작, 셀 클릭 모달
- 관리자 페이지 접근
- 모바일 반응형

---

## 12. Cloudinary 이미지 저장소 ✅

프로덕션 환경 클라우드 이미지 스토리지.

### 문제
- Railway 컨테이너 휘발성 파일시스템
- 컨테이너 재시작 시 업로드 이미지 삭제됨

### 해결
- `cloudinary`, `django-cloudinary-storage` 패키지
- Django 6.0 `STORAGES` 설정
- `CLOUDINARY_URL` 환경변수 기반 조건부 설정

### 환경별 동작
| 환경 | 이미지 저장소 |
|------|--------------|
| 로컬 개발 | `/media/` 로컬 파일시스템 |
| 프로덕션 | Cloudinary CDN |

---

## 13. 커스텀 관리자 페이지 ✅

식당/템플릿/카테고리/사용자 관리 페이지.

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

### Admin API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET/POST | `/api/admin/restaurants/` | 식당 관리 |
| GET/POST | `/api/admin/templates/` | 템플릿 관리 |
| GET/POST | `/api/admin/categories/` | 카테고리 관리 |
| GET/PATCH | `/api/admin/users/` | 사용자 관리 |
| GET | `/api/admin/kakao/search/` | 카카오 장소 검색 |

---

## 14. UI 전면 개편 ✅

캐치테이블 스타일 + Vibrant Orange 테마 적용.

### 디자인 컨셉
**톤앤매너**: 캐치테이블의 정갈한 레이아웃 + 식욕을 자극하는 활기찬 컬러

### 브랜드 컬러
| 컬러명 | HEX | 용도 |
|--------|-----|------|
| `brand-orange` | #FF8A00 | 버튼, 프로그레스 바, 활성 셀 |
| `brand-beige` | #FFF9F0 | 서브 배경, 강조 박스 |
| `brand-charcoal` | #1A1A1A | 텍스트 |
| `brand-gold` | #FFD700 | 별점, 컨페티 |
| `cell-inactive` | #F5F3F0 | 비활성 셀 배경 |

### 기술적 구현
- **Tailwind CSS 4 @theme**: CSS 파일에서 직접 커스텀 컬러 정의
- **CSS 전용 애니메이션**: Framer Motion 미사용 (번들 크기 절감)
- **원형 컨페티**: 이모지 대신 CSS `border-radius: 50%` 도형

### 변경 파일
| 파일 | 변경 내용 |
|------|----------|
| `styles/design-tokens.css` | 신규 - 커스텀 컬러, 컨페티 애니메이션 |
| `utils/cn.js` | 신규 - 클래스네임 유틸리티 |
| `constants/confetti.js` | 신규 - 컨페티 설정 |
| `BingoCell.jsx` | 3가지 렌더링 경로 (이미지+오버레이, 활성, 비활성) |
| 모든 페이지/컴포넌트 | amber → brand-orange 일괄 변경 |

---

## 파일 구조

```
delicious_bingo/
├── PLAN.md                     # 개발 히스토리 (현재 문서)
├── PRD.md                      # 제품 요구사항
├── CLAUDE.md                   # Claude Code 컨텍스트
├── DEPLOY.md                   # 배포 가이드
├── README.md                   # 프로젝트 문서
│
├── backend/
│   ├── api/
│   │   ├── models.py           # 데이터 모델
│   │   ├── serializers.py      # DRF Serializers
│   │   ├── serializers_admin.py # Admin Serializers
│   │   ├── views.py            # ViewSets + Auth APIs
│   │   ├── views_admin.py      # Admin ViewSets
│   │   ├── services.py         # BingoService (라인 감지)
│   │   ├── permissions.py      # IsAdminUser
│   │   ├── urls.py             # API 라우팅
│   │   ├── tests.py            # 87개 테스트
│   │   └── fixtures/initial_data.json
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── Dockerfile
│   ├── start.sh
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── admin/              # 관리자 모듈
    │   ├── api/                # Axios 클라이언트
    │   ├── components/
    │   │   ├── bingo/          # 빙고 컴포넌트
    │   │   ├── modals/         # 모달
    │   │   ├── forms/          # 폼
    │   │   ├── map/            # 카카오맵
    │   │   └── common/         # 공통 컴포넌트
    │   ├── contexts/           # AuthContext
    │   ├── hooks/              # React Query 훅
    │   ├── pages/              # 8개 페이지
    │   ├── styles/             # design-tokens.css
    │   ├── utils/              # cn.js
    │   ├── constants/          # confetti.js
    │   ├── router.jsx
    │   └── index.css
    ├── e2e-dev-test.cjs        # 17개 개발 E2E 테스트
    ├── e2e-prod-test.cjs       # 15개 프로덕션 E2E 테스트
    ├── vercel.json
    └── package.json
```

---

## 테스트 실행 방법

```bash
# Backend 테스트 (87개)
cd backend && source venv/bin/activate && python manage.py test

# Frontend 테스트 (59개)
cd frontend && npm run test:run

# E2E 개발 테스트 (17개) - 로컬 서버 필요
cd frontend && npm run e2e

# E2E 프로덕션 테스트 (15개)
cd frontend && npm run e2e:prod

# 빌드
cd frontend && npm run build
```

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
