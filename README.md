# Delicious Bingo (맛집 빙고)

맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션입니다. 사용자가 맛집 템플릿을 선택하고, 실제 맛집을 방문하여 리뷰를 작성하면 빙고 셀이 활성화되며, 목표 라인 수를 달성하면 빙고 완료!

## 기술 스택

### Backend
- **Django 6.0.1** - Python 웹 프레임워크
- **Django REST Framework 3.16** - REST API
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **Pillow** - 이미지 처리

### Frontend
- **React 19** - UI 라이브러리
- **Vite 7** - 빌드 도구
- **Tailwind CSS 4** - 스타일링
- **React Router 7** - 라우팅
- **TanStack Query 5** - 서버 상태 관리
- **Axios** - HTTP 클라이언트
- **Vitest** - 테스트 프레임워크

---

## 프로젝트 구조

```
delicious_bingo/
├── backend/                    # Django 백엔드
│   ├── api/                    # API 앱
│   │   ├── models.py           # 데이터 모델
│   │   ├── serializers.py      # DRF Serializers
│   │   ├── views.py            # API ViewSets
│   │   ├── services.py         # 빙고 로직 서비스
│   │   ├── urls.py             # API 라우팅
│   │   ├── admin.py            # Admin 설정
│   │   └── tests.py            # 테스트 (40개)
│   ├── config/                 # Django 설정
│   │   ├── settings.py
│   │   └── urls.py
│   ├── venv/                   # Python 가상환경
│   └── manage.py
│
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── api/                # API 클라이언트
│   │   │   ├── client.js       # Axios 인스턴스
│   │   │   └── endpoints.js    # API 함수들
│   │   ├── components/
│   │   │   ├── bingo/          # 빙고 컴포넌트
│   │   │   │   ├── BingoGrid.jsx
│   │   │   │   ├── BingoCell.jsx
│   │   │   │   ├── BingoHeader.jsx
│   │   │   │   ├── CompletionCelebration.jsx
│   │   │   │   └── bingoUtils.js
│   │   │   ├── common/         # 공통 컴포넌트
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── forms/
│   │   │   │   └── ReviewForm.jsx
│   │   │   ├── map/
│   │   │   │   └── KakaoMap.jsx
│   │   │   ├── modals/
│   │   │   │   └── CellDetailModal.jsx
│   │   │   └── Layout.jsx
│   │   ├── hooks/              # Custom Hooks
│   │   │   ├── useTemplates.js
│   │   │   ├── useBoards.js
│   │   │   ├── useLeaderboard.js
│   │   │   └── useKakaoMap.js
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── HomePage.jsx
│   │   │   ├── TemplateListPage.jsx
│   │   │   ├── TemplateDetailPage.jsx
│   │   │   ├── MyBoardsPage.jsx
│   │   │   ├── BoardPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── test/
│   │   │   └── setup.js
│   │   ├── router.jsx
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── PLAN.md                     # 구현 계획
├── PRD.md                      # 제품 요구사항
└── README.md
```

---

## 데이터 모델

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│  Category   │────<│   Restaurant    │────<│  BingoTemplateItem  │
└─────────────┘     └─────────────────┘     └─────────────────────┘
                                                      │
┌─────────────────┐                                   │
│  BingoTemplate  │───────────────────────────────────┘
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐     ┌─────────────┐
│   BingoBoard    │────<│   Review    │
└─────────────────┘     └─────────────┘
        │                     │
        └──────── User ───────┘
```

- **Category**: 맛집 카테고리 (예: 강남 맛집, 홍대 카페)
- **Restaurant**: 맛집 정보 (이름, 주소, 좌표, 카카오 장소 ID)
- **BingoTemplate**: 빙고 템플릿 (25개 맛집 포함)
- **BingoTemplateItem**: 템플릿-맛집 연결 (position 0-24)
- **BingoBoard**: 사용자의 빙고판 (목표 라인 수, 완료 여부)
- **Review**: 맛집 리뷰 (이미지, 평점, 내용, 방문일)

---

## 개발 환경 구축

### 1. 저장소 클론

```bash
git clone <repository-url>
cd delicious_bingo
```

### 2. Backend 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install django djangorestframework django-cors-headers pillow psycopg2-binary

# 또는 requirements.txt가 있다면
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py migrate

# 슈퍼유저 생성 (Admin 접속용)
python manage.py createsuperuser

# 개발 서버 실행
python manage.py runserver
```

백엔드 서버: http://localhost:8000

### 3. 샘플 데이터 생성 (선택)

```bash
cd backend
source venv/bin/activate

# 샘플 데이터 생성
python manage.py seed_data
```

생성되는 데이터:
- **테스트 유저**: `testuser` / `testpass123`
- **카테고리 3개**: 강남 맛집 투어, 홍대 카페 투어, 을지로 노포 탐방
- **맛집 75개**: 각 카테고리당 25개
- **빙고 템플릿 3개**: 각 카테고리별 5x5 빙고판

### 4. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버: http://localhost:5173

### 5. 환경 변수 설정 (선택)

카카오맵 사용 시 `frontend/.env.local` 파일 생성:

```env
VITE_KAKAO_JS_KEY=your_kakao_javascript_key
```

---

## 실행 방법

### 개발 모드

**터미널 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**터미널 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 프로덕션 빌드

```bash
cd frontend
npm run build    # dist/ 폴더에 빌드 결과물 생성
npm run preview  # 빌드 결과물 미리보기
```

---

## 테스트 방법

### Backend 테스트 (40개)

```bash
cd backend
source venv/bin/activate
python manage.py test

# 특정 테스트만 실행
python manage.py test api.tests.BingoServiceTest
python manage.py test api.tests.LeaderboardAPITest
```

테스트 범위:
- `CategoryViewSetTest` - 카테고리 API
- `BingoTemplateViewSetTest` - 템플릿 API
- `BingoBoardViewSetTest` - 빙고판 API
- `ReviewViewSetTest` - 리뷰 API
- `BingoServiceTest` - 빙고 라인 감지 로직
- `LeaderboardAPITest` - 리더보드 API

### Frontend 테스트 (30개)

```bash
cd frontend

# Watch 모드 (개발 중)
npm test

# 단일 실행
npm run test:run
```

테스트 범위:
- `LoadingSpinner.test.jsx` - 로딩 스피너 컴포넌트
- `BingoCell.test.jsx` - 빙고 셀 컴포넌트
- `bingoUtils.test.js` - 빙고 유틸리티 함수
- `useBoards.test.jsx` - 빙고 보드 훅 (쿼리 캐시 무효화)

### 린트 검사

```bash
cd frontend
npm run lint
```

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/categories/` | 카테고리 목록 |
| GET | `/api/templates/` | 활성 템플릿 목록 |
| GET | `/api/templates/:id/` | 템플릿 상세 (25개 아이템 포함) |
| GET | `/api/boards/` | 내 빙고판 목록 |
| POST | `/api/boards/` | 빙고판 생성 |
| GET | `/api/boards/:id/` | 빙고판 상세 (셀 상태 포함) |
| GET | `/api/reviews/` | 리뷰 목록 |
| POST | `/api/reviews/` | 리뷰 생성 (셀 활성화) |
| GET | `/api/leaderboard/` | 리더보드 (최단시간, 총 완료수) |

### 인증

현재 개발 단계에서는 Django 세션 인증을 사용합니다.
- Admin 페이지: http://localhost:8000/admin/
- 로그인 후 API 사용 가능

---

## 주요 기능

### 1. 빙고 템플릿 선택
- 카테고리별 템플릿 조회
- 25개 맛집이 포함된 5x5 그리드 미리보기

### 2. 빙고 도전 시작
- 목표 라인 수 선택 (1줄 / 3줄 / 5줄)
- 개인 빙고판 생성

### 3. 맛집 방문 & 리뷰 작성
- 셀 클릭 → 맛집 상세 정보 확인 (카카오맵 연동)
- 방문 인증 사진 + 평점 + 리뷰 작성
- 리뷰 제출 시 셀 자동 활성화

### 4. 빙고 완료
- 12개 라인 중 목표 달성 시 빙고 완료
- 축하 모달 + 컨페티 효과
- 리더보드 등록

### 5. 리더보드
- 최단 시간 클리어 순위
- 총 완료 횟수 순위

---

## 빙고 라인 규칙

5x5 그리드에서 총 12개 라인:

```
가로 5줄:  [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24]
세로 5줄:  [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24]
대각선 2줄: [0,6,12,18,24], [4,8,12,16,20]
```

---

## Admin 사용법

1. http://localhost:8000/admin/ 접속
2. 슈퍼유저 계정으로 로그인
3. 데이터 관리:
   - **Categories**: 맛집 카테고리 생성
   - **Restaurants**: 맛집 등록 (좌표 필수)
   - **Bingo templates**: 템플릿 생성
   - **Bingo template items**: 템플릿에 맛집 25개 배치 (position 0-24)

---

## 트러블슈팅

### CORS 오류
`backend/config/settings.py`에서 CORS 설정 확인:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### 이미지 업로드 오류
미디어 파일 경로 확인:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### 카카오맵 로드 안됨
- 카카오 개발자 콘솔에서 JavaScript 키 확인
- 허용 도메인에 `localhost` 추가
- `.env.local` 파일에 키 설정

---

## 라이선스

MIT License
