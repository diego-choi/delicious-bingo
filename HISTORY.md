# Delicious Bingo 개발 히스토리

> 맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션

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
| 프로덕션 배포 | Railway + Vercel → Fly.io → OCI VM + Docker + Nginx | 2026-01-10 |
| E2E 테스트 | 개발/프로덕션 환경 | 2026-01-10 |
| Cloudinary 연동 | 클라우드 이미지 저장소 | 2026-01-10 |
| 관리자 페이지 | 식당/템플릿/카테고리 관리 | 2026-01-10 |
| UI 전면 개편 | 캐치테이블 스타일 + Vibrant Orange | 2026-01-23 |
| 카카오 소셜 로그인 | OAuth 2.0 연동, 프로필 관리 | 2026-01-24 |
| Fly.io 단일 플랫폼 통합 | Django SPA 서빙, CORS 제거 | 2026-02-13 |
| P0 보안 및 운영 필수 | Rate Limiting, Health Check, Sentry, 이미지 검증, DB 인덱스 | 2026-02-13 |
| P1 안정성 및 프로덕션 퀄리티 | 토스트, 재시도, 스켈레톤, 확인 다이얼로그, Gunicorn 최적화 | 2026-02-13 |
| P2 ConfirmDialog 접근성 | WCAG 2.1 dialog 패턴 (ARIA, 포커스 트랩, ESC) | 2026-02-13 |
| OCI Always Free Tier 이전 | Fly.io → OCI VM + Docker + Nginx + DuckDNS + Let's Encrypt | 2026-02-20 |

---

## 1. REST API 기초 ✅

카테고리와 빙고 템플릿 조회를 위한 기본 API 구축.

### 구현 내용
- `CategorySerializer`, `RestaurantSerializer` 생성
- `BingoTemplateListSerializer`, `BingoTemplateDetailSerializer` 생성
- `CategoryViewSet`, `BingoTemplateViewSet` (ReadOnly)
- DefaultRouter 설정 및 `/api/` 경로 연결

---

## 2. 빙고 게임 로직 ✅

빙고 보드 생성, 리뷰 작성, 라인 감지 등 핵심 게임 로직 구현.

### 구현 내용
- `BingoService` 클래스: 라인 감지 알고리즘
- `WINNING_LINES` 상수: 12개 빙고 라인 (가로 5, 세로 5, 대각선 2)
- `ReviewSerializer`, `BingoBoardSerializer` 생성
- 리뷰 생성 시 자동 셀 활성화 및 빙고 완료 체크

---

## 3. React 프론트엔드 인프라 ✅

React Router, TanStack Query, Axios 기반 프론트엔드 아키텍처 구축.

### 구현 내용
- `api/client.js`: Axios 인스턴스 + 인증 토큰 인터셉터
- `api/endpoints.js`: templatesApi, boardsApi, reviewsApi
- `hooks/useTemplates.js`, `hooks/useBoards.js`: React Query 훅
- `router.jsx`: 전체 라우트 설정
- `components/Layout.jsx`: 공통 레이아웃 (햄버거 메뉴 포함)

---

## 4. 빙고 UI 컴포넌트 ✅

5x5 빙고 그리드와 셀 컴포넌트 구현.

### 구현 내용
- `BingoGrid.jsx`: 5x5 그리드 레이아웃
- `BingoCell.jsx`: 개별 셀 (활성/비활성/하이라이트)
- `BingoHeader.jsx`: 진행률 바, 통계
- `CompletionCelebration.jsx`: 빙고 완료 축하 모달

---

## 5. 리뷰 시스템 ✅

맛집 리뷰 작성 폼과 상세 모달 구현.

### 구현 내용
- `CellDetailModal.jsx`: 맛집 정보 + 리뷰 표시 + 모바일 바텀시트
- `ReviewForm.jsx`: 이미지 업로드, 별점(1-5), 리뷰 내용, 방문일

---

## 6. 카카오맵 연동 ✅

맛집 위치를 카카오맵에 표시.

### 구현 내용
- `components/map/KakaoMap.jsx`: 지도 컴포넌트
- `hooks/useKakaoMap.js`: 카카오 SDK 로딩 훅
- CellDetailModal에 지도 통합

---

## 7. 리더보드 ✅

빙고 완료 기록 순위 시스템.

### 구현 내용
- `GET /api/leaderboard/`: 리더보드 API
- `LeaderboardPage.jsx`: 탭 UI (최단 시간 / 최다 완료)
- `CompletionCelebration.jsx`: CSS 컨페티 애니메이션

---

## 8. 인증 시스템 ✅

Token 기반 회원가입/로그인 시스템.

### 구현 내용
- DRF TokenAuthentication 설정
- `AuthContext` + `AuthProvider`: 인증 상태 관리
- `LoginPage.jsx`, `RegisterPage.jsx`: 인증 UI

---

## 9. 모바일 반응형 ✅

모바일 우선(Mobile-First) 반응형 디자인 적용.

### 구현 내용
- 기본: 모바일 스타일 → `sm:` 브레이크포인트로 데스크탑 확장
- 햄버거 메뉴 네비게이션, 바텀시트 모달
- Layout, CellDetailModal, BingoGrid, BingoCell 등 반응형 적용

---

## 10. 프로덕션 배포 ✅

배포 플랫폼 변천: Railway + Vercel → Fly.io + Vercel → Fly.io 단일 통합 → OCI VM + Docker + Nginx.

### 구현 내용
- Multi-stage Docker 빌드 (Node.js → Python)
- Django가 WhiteNoise로 Vite SPA 빌드 결과물을 함께 서빙
- Same-origin → CORS 불필요
- Django Admin: `/django-admin/` (SPA `/admin` 충돌 방지)

---

## 11. E2E 테스트 ✅

Playwright 기반 End-to-End 테스트.

### 구현 내용
- 개발 환경 테스트 (18개): 홈페이지, 템플릿, 로그인/회원가입, 빙고 도전, 관리자 페이지, 모바일
- 프로덕션 테스트 (15개): 배포 후 스모크 테스트

---

## 12. Cloudinary 이미지 저장소 ✅

프로덕션 환경 클라우드 이미지 스토리지.

### 동기
- 컨테이너 휘발성 파일시스템으로 재시작 시 업로드 이미지 삭제

### 구현 내용
- `cloudinary`, `django-cloudinary-storage` 패키지
- Django 6.0 `STORAGES` 설정
- `CLOUDINARY_URL` 환경변수 기반 조건부 설정 (로컬: 파일시스템, 프로덕션: Cloudinary CDN)

---

## 13. 커스텀 관리자 페이지 ✅

식당/템플릿/카테고리/사용자 관리 페이지.

### 구현 내용
- 대시보드, 식당/템플릿/카테고리/사용자 CRUD 페이지
- 카카오 장소 검색 연동
- 5x5 그리드 빌더로 템플릿 관리

---

## 14. UI 전면 개편 ✅

캐치테이블 스타일 + Vibrant Orange 테마 적용.

### 구현 내용
- Tailwind CSS 4 `@theme`으로 커스텀 컬러 정의 (`brand-orange`, `brand-beige` 등)
- CSS 전용 애니메이션 (Framer Motion 미사용, 번들 크기 절감)
- 원형 컨페티: 이모지 대신 CSS `border-radius: 50%` 도형

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

### 구현 내용
- 카카오 OAuth 인증 흐름 (인가 코드 → 토큰 발급 → 사용자 정보 조회 → DRF Token 반환)
- `UserProfile` 모델: 편집 가능한 닉네임
- `SocialAccount` 모델: 소셜 로그인 연동 (username: `{provider}_{provider_user_id}` 형식)
- 일반 사용자: 카카오 로그인만 표시, 관리자: `/login?mode=admin`으로 접근

### 테스트 추가 (18개)
- `KakaoOAuthServiceTest`: username 생성, 사용자 생성/조회
- `SocialAccountModelTest`: 모델 제약조건
- `UserProfileModelTest`: 1:1 관계, 닉네임 관리

---

## 16. Fly.io 단일 플랫폼 통합 ✅

Frontend(Vercel)와 Backend(Fly.io) 분리 배포를 Fly.io 단일 배포로 통합.
이후 OCI Always Free Tier로 이전 (섹션 20 참조).

### 동기
- 개인 프로젝트에 2개 플랫폼은 오버 스펙
- CORS 설정 불필요 (same-origin)
- 배포 프로세스 단일화

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
| Gunicorn 워커 최적화 | gthread 2 workers × 2 threads, max-requests 1000 |
| 토스트 알림 | react-hot-toast, alert() 22개 호출 → toast로 교체 (10개 파일) |
| API 재시도 | axios-retry, GET/멱등 요청 2회 재시도 (POST 제외), TanStack Query retry:0 |
| 삭제 확인 다이얼로그 | ConfirmDialog + useConfirmDialog 훅, confirm() 4곳 교체 |
| 빈 상태 UI | 3개 페이지에 아이콘 추가 |
| 스켈레톤 로딩 | SkeletonCard, SkeletonBingoGrid, SkeletonFeedItem (4개 페이지 적용) |

### 새로운 파일
| 파일 | 설명 |
|------|------|
| `frontend/src/components/common/ConfirmDialog.jsx` | 삭제 확인 모달 (danger/default variant) |
| `frontend/src/components/common/ConfirmDialog.test.jsx` | ConfirmDialog 테스트 (19건) |
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

---

## 20. OCI Always Free Tier 이전 ✅

Fly.io에서 OCI (Oracle Cloud Infrastructure) Always Free Tier VM으로 이전.

### 동기
- Fly.io 무료 플랜 제약 (256MB RAM, 머신 자동 중지)
- OCI Always Free Tier로 완전 무료 상시 운영 가능
- 자체 SSL/DNS 관리로 플랫폼 의존도 제거

### 구현 내용
- OCI x86 VM (E2.1.Micro, 1GB RAM) + Docker Compose
- Nginx 리버스 프록시 (SSL 터미네이션)
- DuckDNS 무료 DNS + Let's Encrypt SSL (Certbot 자동 갱신)
- 로컬 빌드 → Docker Hub push → VM에서 pull (1GB RAM 제약으로 VM 빌드 불가)

### 변경/추가 파일
| 파일 | 변경 내용 |
|------|----------|
| `docker-compose.yml` | app + nginx + certbot 서비스 구성 |
| `nginx/` | Nginx 설정 (SSL, reverse proxy) |
| `deploy.sh` | 로컬 빌드 & Docker Hub push 스크립트 |
| `init-letsencrypt.sh` | Let's Encrypt 초기 인증서 발급 |
| `certbot-renew.sh` | 인증서 자동 갱신 스크립트 |
| `DEPLOY.md` | OCI 배포 가이드로 전면 재작성 |

### 삭제 파일
| 파일 | 사유 |
|------|------|
| `fly.toml` | Fly.io 배포 설정 (더 이상 사용하지 않음) |
| `frontend/vercel.json` | Vercel 라우팅 설정 (더 이상 사용하지 않음) |
| `frontend/.vercel/` | Vercel 프로젝트 메타데이터 |
