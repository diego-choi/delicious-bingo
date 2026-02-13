# Delicious Bingo 개발 히스토리

> 맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션

## 프로젝트 상태

| 항목 | 상태 |
|------|------|
| **개발 완료** | ✅ 모든 기능 구현 완료 |
| **프로덕션 배포** | ✅ Fly.io (Django + SPA 단일 배포) |
| **테스트** | ✅ Backend 158개 / Frontend 102개 / E2E 33개 |

### 배포 URL
- https://delicious-bingo.fly.dev

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
| 프로덕션 배포 | Railway + Vercel → Fly.io + Supabase → Fly.io 단일 통합 | 2026-01-10 |
| E2E 테스트 | 개발/프로덕션 환경 | 2026-01-10 |
| Cloudinary 연동 | 클라우드 이미지 저장소 | 2026-01-10 |
| 관리자 페이지 | 식당/템플릿/카테고리 관리 | 2026-01-10 |
| UI 전면 개편 | 캐치테이블 스타일 + Vibrant Orange | 2026-01-23 |
| 카카오 소셜 로그인 | OAuth 2.0 연동, 프로필 관리 | 2026-01-24 |
| Fly.io 단일 플랫폼 통합 | Django SPA 서빙, CORS 제거 | 2026-02-13 |
| P1 안정성 및 프로덕션 퀄리티 | 토스트, 재시도, 스켈레톤, 확인 다이얼로그, Gunicorn 최적화 | 2026-02-13 |

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

배포 플랫폼 변천: Railway + Vercel → Fly.io + Vercel → **Fly.io 단일 통합**.

### 현재: Fly.io 단일 배포
- Multi-stage Docker 빌드 (Node.js → Python)
- Django가 WhiteNoise로 Vite SPA 빌드 결과물을 함께 서빙
- Same-origin → CORS 불필요
- `VITE_API_URL=/api` (상대 경로)
- Django Admin: `/django-admin/` (SPA `/admin` 충돌 방지)

---

## 11. E2E 테스트 ✅

Playwright 기반 End-to-End 테스트.

### 개발 환경 테스트 (18개)
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

## 15. 카카오 소셜 로그인 ✅

카카오 OAuth 2.0 기반 소셜 로그인 구현.

### 인증 흐름
1. 프론트엔드: `/api/auth/kakao/login/` 호출 → 카카오 로그인 URL 반환
2. 사용자: 카카오 로그인 페이지에서 인증
3. 카카오: redirect_uri로 인가 코드 전달
4. 프론트엔드: `/api/auth/kakao/callback/`에 인가 코드 전송
5. 백엔드: 토큰 발급 및 사용자 정보 조회 → DRF Token 반환

### 새로운 모델
| 모델 | 설명 |
|------|------|
| `UserProfile` | 사용자 프로필 (닉네임 등 편집 가능 정보) |
| `SocialAccount` | 소셜 로그인 연동 (provider, provider_user_id) |

### Username 생성 규칙
소셜 로그인 사용자의 username은 `{provider}_{provider_user_id}` 형식으로 자동 생성.
- 예시: `kakao_1234567890`
- 장점: 고유성 보장, 소셜 계정 식별 용이

### API 엔드포인트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/auth/kakao/login/` | 카카오 로그인 URL 생성 |
| POST | `/api/auth/kakao/callback/` | 카카오 OAuth 콜백 |

### 로그인 페이지 변경
- 일반 사용자: 카카오 로그인만 표시
- 관리자 로그인: `/login?mode=admin` URL로 접근

### 프로필 관리
- `UserProfile.nickname`: 사용자가 편집 가능한 닉네임
- 프로필 페이지에서 닉네임 수정 가능
- 네비게이션 바에 display_name 실시간 반영

### 테스트 추가 (18개)
- `KakaoOAuthServiceTest`: username 생성, 사용자 생성/조회
- `SocialAccountModelTest`: 모델 제약조건
- `UserProfileModelTest`: 1:1 관계, 닉네임 관리

### 환경변수
```bash
KAKAO_REST_API_KEY=<카카오 REST API 키>
KAKAO_CLIENT_SECRET=<카카오 Client Secret>
```

---

## 16. Fly.io 단일 플랫폼 통합 ✅

Frontend(Vercel)와 Backend(Fly.io) 분리 배포를 Fly.io 단일 배포로 통합.

### 동기
- 개인 프로젝트에 2개 플랫폼은 오버 스펙
- CORS 설정 불필요 (same-origin)
- 배포 프로세스 단일화 (`fly deploy` 한 번)

### 구현 내용
- `Dockerfile`을 프로젝트 루트로 이동, Multi-stage build (Node + Python)
- WhiteNoise `WHITENOISE_ROOT`로 `frontend_dist/` 정적 파일 서빙
- Vite 해시 파일명 장기 캐시, `index.html` no-cache 설정
- SPA catch-all 라우트 (`SPAView` → `index.html`)
- Django Admin URL을 `django-admin/`으로 변경
- `CORS_ALLOWED_ORIGINS` 환경변수 제거 (로컬 개발용 기본값만 유지)

### 변경 파일
| 파일 | 변경 내용 |
|------|----------|
| `Dockerfile` | 루트로 이동, Node.js 빌드 스테이지 추가 |
| `.dockerignore` | `frontend/` 허용, `node_modules`만 제외 |
| `fly.toml` | Dockerfile 경로 변경, `VITE_KAKAO_JS_KEY` build arg 추가 |
| `backend/config/settings.py` | `WHITENOISE_ROOT`, `TEMPLATES DIRS`, 캐시 헤더 설정 |
| `backend/config/urls.py` | `django-admin/` URL, SPA catch-all 추가 |

---

## 17. P0 보안 및 운영 필수 ✅

보안 및 운영에 필수적인 5개 P0 항목 일괄 구현.

### 구현 내용

| 기능 | 설명 |
|------|------|
| API Rate Limiting | 로그인/회원가입 brute force 방지 (10회/분) |
| Health Check | `GET /api/health/` 엔드포인트 |
| Sentry 에러 모니터링 | `SENTRY_DSN` 환경변수 기반 조건부 초기화 |
| 이미지 업로드 검증 | 파일 크기 5MB 제한 |
| DB 인덱스 | BingoBoard(user+created_at, is_completed+completed_at), Review(is_public+created_at) |

### 새로운 파일
| 파일 | 설명 |
|------|------|
| `backend/api/throttles.py` | `AuthRateThrottle` (AnonRateThrottle 서브클래스) |
| `backend/api/validators.py` | `validate_image_file_size` (5MB 제한) |

### 변경 파일
| 파일 | 변경 내용 |
|------|----------|
| `backend/api/views.py` | `health_check` 뷰 추가 |
| `backend/api/views_auth.py` | `register_view`, `login_view`에 Rate Limiting 적용 |
| `backend/api/urls.py` | `/api/health/` 경로 추가 |
| `backend/api/models.py` | Review.image에 파일 크기 검증, BingoBoard/Review에 DB 인덱스 추가 |
| `backend/config/settings.py` | Sentry 초기화, `DEFAULT_THROTTLE_RATES` 추가 |
| `backend/requirements.txt` | `sentry-sdk[django]` 추가 |

---

## 18. P1 안정성 및 프로덕션 퀄리티 ✅

프로덕션 품질 향상을 위한 6개 P1 항목 일괄 구현.

### 구현 내용

| 기능 | 설명 |
|------|------|
| Gunicorn 워커 최적화 | gthread 2 workers × 2 threads, max-requests 1000 (Fly.io 256MB 최적) |
| 토스트 알림 | react-hot-toast, alert() 22개 호출 → toast로 교체 (10개 파일) |
| API 재시도 | axios-retry, GET/멱등 요청 2회 재시도 (POST 제외), TanStack Query retry:0 |
| 삭제 확인 다이얼로그 | ConfirmDialog + useConfirmDialog 훅, confirm() 4곳 교체 |
| 빈 상태 UI | 3개 페이지에 아이콘 추가 (🎯📋📝) |
| 스켈레톤 로딩 | SkeletonCard, SkeletonBingoGrid, SkeletonFeedItem (4개 페이지 적용) |

### 새로운 파일
| 파일 | 설명 |
|------|------|
| `frontend/src/components/common/ConfirmDialog.jsx` | 삭제 확인 모달 (danger/default variant) |
| `frontend/src/components/common/ConfirmDialog.test.jsx` | ConfirmDialog 테스트 (7건) |
| `frontend/src/components/common/Skeleton.jsx` | 스켈레톤 3종 (Card, BingoGrid, FeedItem) |
| `frontend/src/components/common/Skeleton.test.jsx` | Skeleton 테스트 (3건) |
| `frontend/src/hooks/useConfirmDialog.js` | Promise 기반 확인 다이얼로그 훅 |
| `frontend/src/hooks/useConfirmDialog.test.js` | useConfirmDialog 테스트 (6건) |
| `frontend/src/api/client.test.js` | API 클라이언트 테스트 (5건) |

### 주요 변경 파일
| 파일 | 변경 내용 |
|------|----------|
| `backend/start.sh` | Gunicorn gthread 워커 설정 |
| `frontend/src/main.jsx` | Toaster 마운트, TanStack Query retry:0 |
| `frontend/src/api/client.js` | axios-retry, timeout 15초 |
| 10개 페이지/컴포넌트 | alert() → toast 교체 |
| 4개 페이지 | confirm() → ConfirmDialog 교체 |
| 4개 페이지 | 로딩 상태를 스켈레톤으로 교체 |

### 삭제된 파일
| 파일 | 사유 |
|------|------|
| `frontend/src/components/common/LoadingSpinner.jsx` | 스켈레톤으로 대체, 참조 0건 |
| `frontend/src/components/common/LoadingSpinner.test.jsx` | 위 파일의 테스트 |

---

## 19. P2 ConfirmDialog 접근성 개선 ✅

WCAG 2.1 dialog 패턴에 맞게 ConfirmDialog에 키보드/스크린리더 접근성 추가.

### 구현 내용
| 기능 | 설명 |
|------|------|
| ARIA 속성 | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`/`aria-describedby` ID 연결 |
| ESC 키 닫기 | `document` keydown 리스너로 ESC → `onCancel()` 호출 |
| 포커스 관리 | 열릴 때 취소 버튼 자동 포커스, 닫힐 때 이전 포커스 복원 |
| 포커스 트랩 | Tab/Shift+Tab으로 다이얼로그 내 버튼 간 순환 |
| 스크롤 잠금 | `body.style.overflow = 'hidden'`, unmount 시 cleanup 보장 |
| 백드롭 | `aria-hidden="true"` 추가 |

### 테스트 추가 (12개)
| 테스트 | 검증 내용 |
|--------|----------|
| ARIA 속성 3개 | role, aria-modal, aria-labelledby, aria-describedby |
| ESC 키 1개 | ESC 입력 시 onCancel 호출 |
| 포커스 관리 2개 | 자동 포커스, 닫힐 때 복원 |
| 포커스 트랩 2개 | Tab 순환, Shift+Tab 역순환 |
| 스크롤 잠금 2개 | 열림 시 hidden, 닫힐 때 복원 |
| unmount cleanup 2개 | 열린 채 unmount 시 스크롤/포커스 복원 |

### 변경 파일
| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/components/common/ConfirmDialog.jsx` | useEffect/useRef 추가, ARIA 속성, 키보드/포커스/스크롤 로직 |
| `frontend/src/components/common/ConfirmDialog.test.jsx` | 접근성 테스트 12개 추가 (기존 7 + 신규 12 = 19개) |
| `PRD.md` | P2 ConfirmDialog 완료 처리, useModalA11y 훅 추출 항목 추가 |

### 향후 계획
- `useModalA11y` 훅 추출 → CellDetailModal, CompletionCelebration에 공통 적용

