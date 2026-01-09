# Product Requirements Document (PRD): Delicious Bingo

## 1. Project Summary
- **Project Name:** Delicious Bingo (맛집 도장깨기 빙고)
- **Concept:** A mobile web application where food enthusiasts complete a 5x5 bingo board by visiting specific restaurants and leaving reviews.
- **Core Value:** Gamification of food tours, achievement tracking through bingo, and community-based restaurant discovery.
- **Status:** ✅ 구현 완료 및 프로덕션 배포 완료

## 2. Tech Stack (구현 완료)

### Backend
- Python 3.12
- Django 6.0.1
- Django REST Framework 3.16
- Token Authentication
- PostgreSQL (Railway)
- Gunicorn + WhiteNoise
- Cloudinary (이미지 저장소)

### Frontend
- React 19
- Vite 7
- Tailwind CSS 4
- React Router 7
- TanStack Query 5
- Axios
- Playwright (E2E 테스트)

### Infrastructure
- Backend: Railway (Docker)
- Frontend: Vercel
- Database: Railway PostgreSQL
- Image Storage: Cloudinary

### Maps API
- Kakao Maps API

## 3. Database Schema (Django Models) ✅ 구현 완료

### 3.1. Infrastructure
- **Category:** `name`, `description`
- **Restaurant:**
  - `category` (FK), `name`, `address`
  - `latitude`, `longitude`, `kakao_place_id`, `place_url`
  - `is_approved` (Admin approval required)
  - `created_by` (User FK)

### 3.2. Bingo Logic (Template & Instance)
- **BingoTemplate:** `category`, `title`, `description`, `is_active`
- **BingoTemplateItem:**
  - `template` (FK), `restaurant` (FK)
  - `position` (Integer, 0-24 for 5x5 grid placement)
- **BingoBoard (User Challenge):**
  - `user` (FK), `template` (FK)
  - `target_line_count` (1, 3, or 5 lines)
  - `is_completed`, `created_at`, `completed_at`

### 3.3. Content
- **Review:**
  - `user` (FK), `bingo_board` (FK), `restaurant` (FK)
  - `image` (Required), `content` (Min 10 chars), `rating` (1-5), `visited_date`
  - `is_public` (Boolean, default: True)

## 4. Key Functional Requirements

### 4.1. Admin Tools (P0) ✅ 완료
- [x] Django Admin으로 `BingoTemplate` 관리
- [x] 25개 `Restaurant`를 특정 `position`에 할당
- [x] 초기 데이터 fixture (`loaddata initial_data`)

### 4.2. Bingo Gameplay (P0) ✅ 완료
- [x] 템플릿 선택 → `BingoBoard` 인스턴스 생성
- [x] 5x5 그리드 UI (맛집명 표시)
- [x] 셀 활성화: 해당 맛집에 대한 `Review` 존재 시
- [x] 빙고 로직: 가로/세로/대각선 12개 라인 감지
- [x] 목표 라인 달성 시 완료 처리

### 4.3. User Features (P1) ✅ 완료
- [x] 회원가입 / 로그인 / 로그아웃
- [x] 카카오맵 연동 (맛집 위치 표시)
- [x] 리더보드 (최단 시간 클리어, 총 완료 횟수)
- [x] 빙고 완료 시 축하 모달 (컨페티 효과)

### 4.4. Mobile Responsive (P1) ✅ 완료
- [x] 모바일 우선 디자인
- [x] 햄버거 메뉴 네비게이션
- [x] 바텀시트 모달
- [x] 터치 친화적 UI

## 5. API Endpoints ✅ 구현 완료

### Public Endpoints
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/categories/` | 카테고리 목록 |
| GET | `/api/templates/` | 템플릿 목록 (활성 템플릿만) |
| GET | `/api/templates/:id/` | 템플릿 상세 (25개 셀 포함) |
| GET | `/api/leaderboard/` | 리더보드 |

### Auth Endpoints
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/register/` | 회원가입 (토큰 발급) |
| POST | `/api/auth/login/` | 로그인 (토큰 발급) |
| POST | `/api/auth/logout/` | 로그아웃 |
| GET | `/api/auth/me/` | 현재 사용자 정보 |

### Protected Endpoints (인증 필요)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/boards/` | 내 빙고판 목록 |
| POST | `/api/boards/` | 빙고판 생성 |
| GET | `/api/boards/:id/` | 빙고판 상세 |
| POST | `/api/reviews/` | 리뷰 생성 → 셀 활성화 |

## 6. Production Deployment ✅ 완료

### Backend (Railway)
- **URL:** https://delicious-bingo-production.up.railway.app
- **Build:** Docker (python:3.12-slim)
- **Database:** Railway PostgreSQL

### Frontend (Vercel)
- **URL:** https://delicious-bingo.vercel.app
- **Build:** Vite
- **Cache:** stale-while-revalidate 전략

### Environment Variables
```bash
# Backend (Railway)
SECRET_KEY, DEBUG, ALLOWED_HOSTS, DATABASE_URL, CORS_ALLOWED_ORIGINS, CLOUDINARY_URL

# Frontend (Vercel)
VITE_API_URL, VITE_KAKAO_JS_KEY
```

## 7. Testing ✅ 완료

### Backend
- 55개 유닛 테스트
- BingoService 라인 감지 테스트
- API 인증 테스트
- 이미지 URL 테스트

### Frontend
- 25개 컴포넌트 테스트 (Vitest + Testing Library)

### E2E Production
- 12개 Playwright 테스트
- 홈페이지, 템플릿, 로그인/회원가입, 리더보드
- 회원가입/로그인 플로우
- 모바일 반응형

## 8. Future Improvements (TODO)

- [ ] 소셜 로그인 연동 (카카오, 구글)
- [ ] 푸시 알림
- [ ] 맛집 검색 기능
- [ ] 사용자 프로필 페이지
- [ ] 리뷰 좋아요/댓글
- [ ] 템플릿 공유 기능
