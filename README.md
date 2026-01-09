# Delicious Bingo (맛집 빙고)

맛집 탐방을 게임화한 빙고 웹 애플리케이션입니다. 5x5 빙고판의 맛집들을 방문하고 리뷰를 작성하여 빙고를 완성하세요!

## 기술 스택

### Backend
- Python 3.12
- Django 6.0
- Django REST Framework
- PostgreSQL
- Gunicorn
- Cloudinary (이미지 저장소)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Query
- React Router

### 배포
- Backend: Railway
- Frontend: Vercel
- Database: Railway PostgreSQL

---

## 로컬 개발 환경 설정

### Backend

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 마이그레이션
python manage.py migrate

# 초기 데이터 로드
python manage.py loaddata initial_data

# 개발 서버 실행
python manage.py runserver
```

### Frontend

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 VITE_API_URL 설정

# 개발 서버 실행
npm run dev
```

---

## 프로덕션 배포

자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md)를 참조하세요.

### 현재 배포 URL
- Backend API: https://delicious-bingo-production.up.railway.app/api/
- Frontend: https://delicious-bingo.vercel.app

---

## 배포 트러블슈팅

### 1. Railway: Nixpacks pip not found 오류

**증상:**
```
/bin/bash: line 1: pip: command not found
```

**원인:** Nixpacks 빌더가 pip을 찾지 못함

**해결:** Dockerfile 사용으로 전환
```dockerfile
FROM python:3.12-slim
# ... Dockerfile로 직접 빌드 환경 제어
```

---

### 2. Railway: Django 버전과 Python 버전 불일치

**증상:**
```
Django==6.0.1 Requires-Python >=3.12
```

**원인:** Dockerfile에서 Python 3.11 사용

**해결:** Dockerfile에서 Python 3.12 사용
```dockerfile
FROM python:3.12-slim  # 3.11 대신 3.12 사용
```

---

### 3. Railway: $PORT 환경변수 미적용

**증상:**
```
Error: '$PORT' is not a valid port number.
```

**원인:** `railway.json`이 Dockerfile을 무시하고 Nixpacks 빌더와 startCommand를 강제 적용. startCommand에서 `$PORT`가 문자열 그대로 전달됨.

**해결:** `railway.json` 삭제
```bash
rm backend/railway.json
```

Railway가 자동으로 Dockerfile을 감지하여 사용. `start.sh`에서 환경변수 확장이 정상 동작:
```bash
exec gunicorn config.wsgi --bind "0.0.0.0:${PORT:-8000}"
```

---

### 4. Railway: Root Directory 미설정

**증상:** 배포 시 Dockerfile을 찾지 못하거나, 로그 없이 crashed 상태

**원인:** 모노레포 구조에서 backend 디렉토리를 인식하지 못함

**해결:** Railway 대시보드에서 설정
1. 서비스 선택 → **Settings** 탭
2. **General** → **Root Directory**: `backend` 입력
3. Save 후 Redeploy

---

### 5. Railway: ALLOWED_HOSTS 설정

**증상:**
```
Invalid HTTP_HOST header: 'your-app.railway.app'
```

**해결:** Railway 환경변수 설정
```
ALLOWED_HOSTS=.railway.app
```

> `.railway.app`은 모든 서브도메인을 허용 (예: `xxx.up.railway.app`)

---

### 6. Vercel: VITE_API_URL 환경변수 미적용

**증상:** 프론트엔드에서 API 호출 시 `http://localhost:8000`으로 요청

**원인:** Vite 환경변수는 빌드 시점에 번들에 포함되어야 함. CLI로 전달한 `-e` 옵션이 빌드에 반영되지 않음.

**해결:** Vercel 대시보드에서 환경변수 설정
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 추가:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend.railway.app/api`
   - Environment: Production (체크)
4. **Redeploy** 실행

또는 Vercel CLI:
```bash
vercel env add VITE_API_URL production
# 값 입력: https://your-backend.railway.app/api
vercel --prod
```

---

### 7. CORS 오류

**증상:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결:** Railway 환경변수에 프론트엔드 도메인 추가
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

---

### 8. 초기 데이터 로드

**Railway SSH 접속:**
```bash
railway ssh
```

**데이터 로드:**
```bash
python manage.py loaddata initial_data
```

**슈퍼유저 생성:**
```bash
python manage.py createsuperuser
```

---

## 환경변수 체크리스트

### Railway (Backend)
| 변수 | 필수 | 설명 | 예시 |
|------|:----:|------|------|
| `SECRET_KEY` | O | Django 시크릿 키 | `django-insecure-xxx...` |
| `DEBUG` | O | 디버그 모드 | `False` |
| `ALLOWED_HOSTS` | O | 허용 호스트 | `.railway.app` |
| `DATABASE_URL` | O | PostgreSQL URL | 자동 설정 (Railway) |
| `CORS_ALLOWED_ORIGINS` | O | CORS 허용 도메인 | `https://xxx.vercel.app` |
| `CLOUDINARY_URL` | O | Cloudinary 연결 URL | `cloudinary://API_KEY:SECRET@CLOUD_NAME` |
| `KAKAO_REST_API_KEY` | - | 카카오 REST API 키 (관리자 검색용) | `abc123...` |

### Vercel (Frontend)
| 변수 | 필수 | 설명 | 예시 |
|------|:----:|------|------|
| `VITE_API_URL` | O | Backend API URL | `https://xxx.railway.app/api` |
| `VITE_KAKAO_JS_KEY` | - | 카카오 JavaScript 키 (지도용) | `abc123...` |

---

## 프로젝트 구조

```
delicious_bingo/
├── backend/
│   ├── api/                 # Django 앱
│   │   ├── fixtures/        # 초기 데이터
│   │   ├── models.py        # 데이터 모델
│   │   ├── serializers.py   # DRF Serializers
│   │   ├── serializers_admin.py  # Admin API Serializers
│   │   ├── services.py      # 비즈니스 로직 (빙고 판정)
│   │   ├── views.py         # API Views
│   │   ├── views_admin.py   # Admin API Views
│   │   └── permissions.py   # 권한 클래스
│   ├── config/              # Django 설정
│   ├── Dockerfile           # 프로덕션 빌드
│   ├── start.sh             # 컨테이너 시작 스크립트
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # API 클라이언트
│   │   ├── admin/           # 관리자 페이지 (식당/템플릿/카테고리)
│   │   ├── components/      # React 컴포넌트
│   │   ├── hooks/           # Custom Hooks
│   │   └── pages/           # 페이지 컴포넌트
│   ├── e2e-prod-test.cjs    # E2E 프로덕션 테스트
│   ├── vercel.json          # Vercel SPA 설정
│   └── package.json
├── DEPLOY.md                # 배포 가이드
└── README.md                # 이 파일
```

---

## 테스트

### 유닛 테스트

```bash
# Backend
cd backend && python manage.py test

# Frontend
cd frontend && npm run test:run
```

### E2E 프로덕션 테스트

Playwright 기반으로 프로덕션 환경의 전체 기능을 테스트합니다.

```bash
cd frontend

# 최초 1회 설치
npm install -D playwright
npx playwright install chromium

# 테스트 실행
node e2e-prod-test.cjs
```

**테스트 항목 (12개):**
- 홈페이지, 템플릿 목록/상세, 로그인/회원가입 페이지
- 테스트 계정 숨김 (Production)
- 리더보드, API 연결
- 회원가입/로그인 플로우
- 보호된 라우트, 모바일 반응형

---

## 라이선스

MIT License
