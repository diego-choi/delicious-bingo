# Delicious Bingo 배포 가이드

## 배포 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│    Railway      │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Cloudinary    │
                        │ (Image Storage) │
                        └─────────────────┘
```

| 서비스 | 용도 | URL |
|--------|------|-----|
| Vercel | Frontend (React + Vite) | https://delicious-bingo.vercel.app |
| Railway | Backend (Django + DRF) | https://delicious-bingo-production.up.railway.app |
| Railway | PostgreSQL Database | - |
| Cloudinary | 이미지 저장소 | - |
| Kakao | 지도 표시 + 장소 검색 | - |

---

## 1. Backend 배포 (Railway)

### 1.1 프로젝트 생성
1. [Railway](https://railway.app) → GitHub 로그인
2. "New Project" → "Provision PostgreSQL" (DB 먼저 생성)
3. "New Service" → GitHub 저장소 연결

### 1.2 설정
| 설정 | 값 |
|------|-----|
| Root Directory | `backend` (또는 비워두기 - railway.json 사용 시) |
| Builder | Dockerfile (자동 감지) |

**railway.json 사용 (권장)**:
프로젝트 루트에 `railway.json` 파일이 있으면 Root Directory를 비워두세요.
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
  },
  "deploy": {
    "startCommand": "sh backend/start.sh",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**주의**: Root Directory를 `/backend`로 설정하지 마세요 (절대 경로로 인식되어 오류 발생)

### 1.3 환경 변수
```bash
SECRET_KEY=<django-secret-key>
DEBUG=False
ALLOWED_HOSTS=.railway.app
DATABASE_URL=<PostgreSQL 연결 시 자동 설정>
CORS_ALLOWED_ORIGINS=https://delicious-bingo.vercel.app
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
KAKAO_REST_API_KEY=<카카오-REST-API-키>
KAKAO_CLIENT_SECRET=<카카오-Client-Secret>
```

**주의**: `python-dotenv`는 프로덕션에서 불필요합니다. `settings.py`에서 선택적 import 처리됨.

> Secret Key 생성: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### 1.4 초기 데이터
```bash
railway ssh
python manage.py createsuperuser
python manage.py loaddata initial_data
```

---

## 2. Frontend 배포 (Vercel)

### 2.1 프로젝트 생성
1. [Vercel](https://vercel.com) → GitHub 로그인
2. "New Project" → 저장소 Import
3. Framework: Vite, Root Directory: `frontend`

### 2.2 환경 변수 (배포 전 필수 설정)
| 변수 | 값 |
|------|-----|
| `VITE_API_URL` | `https://delicious-bingo-production.up.railway.app/api` |
| `VITE_KAKAO_JS_KEY` | `<카카오-JavaScript-키>` |

> **중요**: Vite는 빌드 시점에 환경변수를 번들에 포함하므로, 반드시 배포 전에 설정

### 2.3 자동 배포 설정

**Git Integration 연결**:
1. Settings → Git → Connect Git Repository
2. GitHub 저장소 선택

**선택적 빌드 (Ignored Build Step)**:
1. Settings → Build and Deployment → Ignored Build Step
2. Custom 선택 → `git diff --quiet HEAD^ HEAD -- .`

> frontend/ 변경 시에만 빌드 실행, 다른 파일 변경 시 스킵

---

## 3. 외부 서비스 설정

### 3.1 Cloudinary
1. [Cloudinary](https://cloudinary.com) 가입
2. Dashboard에서 Cloud Name, API Key, API Secret 확인
3. Railway 환경변수에 `CLOUDINARY_URL` 설정

### 3.2 카카오 개발자

#### 애플리케이션 설정
1. [카카오 개발자](https://developers.kakao.com) → 애플리케이션 생성
2. 앱 키 확인:
   - **REST API 키** → Railway `KAKAO_REST_API_KEY`
   - **JavaScript 키** → Vercel `VITE_KAKAO_JS_KEY`

#### 플랫폼 설정
3. 플랫폼 → Web → 사이트 도메인 등록:
   - `http://localhost:5173` (개발)
   - `https://delicious-bingo.vercel.app` (프로덕션)

#### 카카오 로그인 설정 (소셜 로그인용)
4. 제품 설정 → 카카오 로그인:
   - **카카오 로그인 활성화**: ON
   - **Redirect URI** 등록:
     - `http://localhost:5173/auth/kakao/callback` (개발)
     - `https://delicious-bingo.vercel.app/auth/kakao/callback` (프로덕션)

5. 동의항목 설정:
   - **닉네임**: 필수 동의
   - **프로필 이미지**: 선택 동의
   - **카카오계정(이메일)**: 선택 동의

6. 보안 설정:
   - **Client Secret**: 활성화
   - 생성된 값을 Railway `KAKAO_CLIENT_SECRET`에 설정

---

## 4. 배포 확인

### API 테스트
```bash
# 카테고리 API
curl https://delicious-bingo-production.up.railway.app/api/categories/

# 카카오 로그인 URL 생성
curl "https://delicious-bingo-production.up.railway.app/api/auth/kakao/authorize/?redirect_uri=https://delicious-bingo.vercel.app/auth/kakao/callback"
```

### 카카오 소셜 로그인 수동 테스트
1. https://delicious-bingo.vercel.app 접속
2. 카카오 로그인 버튼 클릭
3. 카카오 계정으로 로그인
4. 콜백 후 프로필 페이지 확인
5. 닉네임 수정 테스트

### E2E 프로덕션 테스트
```bash
cd frontend && npm run e2e:prod
```

**예상 결과**: 15개 테스트 중 13개 이상 성공 (프로필 관련 2개는 테스트 데이터 의존)

---

## 5. 환경 변수 요약

### Railway (Backend)
| 변수 | 필수 | 설명 |
|------|:----:|------|
| `SECRET_KEY` | O | Django 시크릿 키 |
| `DEBUG` | O | `False` |
| `ALLOWED_HOSTS` | O | `.railway.app` |
| `DATABASE_URL` | O | PostgreSQL 연결 시 자동 |
| `CORS_ALLOWED_ORIGINS` | O | Vercel URL |
| `CLOUDINARY_URL` | O | 이미지 저장소 |
| `KAKAO_REST_API_KEY` | O | 카카오 REST API 키 (소셜 로그인 + 장소 검색) |
| `KAKAO_CLIENT_SECRET` | O | 카카오 Client Secret (소셜 로그인 보안) |

### Vercel (Frontend)
| 변수 | 필수 | 설명 |
|------|:----:|------|
| `VITE_API_URL` | O | Backend API URL |
| `VITE_KAKAO_JS_KEY` | - | 지도 표시 |

---

## 6. 업데이트 배포

### 자동 배포 (권장)
```bash
git push origin master
# → Railway + Vercel 자동 빌드 및 배포
```

### 수동 배포
```bash
# Backend
cd backend && railway up

# Frontend
cd frontend && vercel --prod
```

---

## 7. 체크리스트

### 환경 설정
- [ ] `SECRET_KEY` 설정
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` 설정
- [ ] `CORS_ALLOWED_ORIGINS` 설정
- [ ] `CLOUDINARY_URL` 설정
- [ ] `KAKAO_REST_API_KEY` 설정
- [ ] `KAKAO_CLIENT_SECRET` 설정
- [ ] 카카오 플랫폼 도메인 등록
- [ ] 카카오 Redirect URI 등록
- [ ] 카카오 동의항목 설정

### 자동 배포
- [ ] Railway: Root Directory `backend` (또는 비워두기)
- [ ] Railway: `railway.json` 파일 생성 (권장)
- [ ] Vercel: Git Integration 연결
- [ ] Vercel: Root Directory `frontend`
- [ ] Vercel: Ignored Build Step 설정
- [ ] 자동 배포 테스트 완료

---

## 8. 비용

| 서비스 | 무료 티어 |
|--------|----------|
| Railway | 월 $5 크레딧 |
| Vercel | 개인 프로젝트 무제한 |
| Cloudinary | 25GB 저장, 25GB 대역폭/월 |

---

## 9. 알려진 문제 및 해결 방법

### Railway Root Directory 오류
**증상**: `Could not find root directory: /backend`

**원인**: Root Directory를 `/backend`로 설정 (절대 경로로 인식)

**해결**:
1. Root Directory를 `backend`로 변경 (슬래시 제거)
2. 또는 Root Directory를 비우고 `railway.json` 사용 (권장)

---

### ModuleNotFoundError: No module named 'dotenv'
**증상**: 배포 시 `dotenv` import 오류

**원인**: `python-dotenv`가 `requirements.txt`에 없거나 프로덕션에서 불필요

**해결**: `settings.py`에서 선택적 import 처리
```python
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    pass
```

---

### 카카오 로그인 404 오류
**증상**: `/api/auth/kakao/login/` 접근 시 404

**원인**: 마이그레이션 미적용 또는 배포 실패

**해결**:
1. Railway 로그 확인: `railway logs`
2. 마이그레이션 확인: "Applying api.0002_add_social_account... OK"
3. 재배포: `railway up --detach`

---

### 카카오 Redirect URI 불일치
**증상**: 카카오 로그인 시 "redirect_uri mismatch" 오류

**해결**: 카카오 개발자 콘솔에서 정확한 Redirect URI 등록
- 프로덕션: `https://delicious-bingo.vercel.app/auth/kakao/callback`
- 개발: `http://localhost:5173/auth/kakao/callback`

---

## 문제 해결

배포 중 문제가 발생하면 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 참조.
