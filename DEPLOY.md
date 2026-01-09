# Delicious Bingo 배포 가이드

## 아키텍처 개요

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│    Railway      │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
│   React + Vite  │     │  Django + DRF   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Django + Gunicorn)
- **Database**: Railway PostgreSQL

---

## 1. Backend 배포 (Railway)

### 1.1 Railway 계정 생성
1. [Railway](https://railway.app) 접속
2. GitHub 계정으로 로그인

### 1.2 PostgreSQL 데이터베이스 생성
1. Railway 대시보드에서 "New Project" 클릭
2. "Provision PostgreSQL" 선택
3. 생성된 DB의 "Variables" 탭에서 `DATABASE_URL` 확인

### 1.3 Django 앱 배포
1. "New Service" → "GitHub Repo" 선택
2. `delicious_bingo` 저장소 선택
3. Root Directory를 `backend`로 설정
4. 환경 변수 설정:

```bash
# 필수 환경 변수
SECRET_KEY=<생성한-시크릿-키>
DEBUG=False
ALLOWED_HOSTS=<your-app>.railway.app
DATABASE_URL=<PostgreSQL-URL>
CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app

# 시크릿 키 생성 (터미널에서 실행)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

5. "Deploy" 클릭
6. 배포 완료 후 "Settings" → "Generate Domain" 클릭

### 1.4 초기 데이터 설정
Railway Shell에서 실행:
```bash
python manage.py createsuperuser
python manage.py seed_data
```

---

## 2. Frontend 배포 (Vercel)

### 2.1 Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인

### 2.2 프로젝트 배포
1. "New Project" 클릭
2. `delicious_bingo` 저장소 Import
3. Framework Preset: "Vite" 선택
4. Root Directory: `frontend` 입력
5. 환경 변수 설정:

```bash
VITE_API_URL=https://<your-backend>.railway.app/api
VITE_KAKAO_JS_KEY=<카카오-API-키>  # 선택
```

6. "Deploy" 클릭

### 2.3 도메인 설정 (선택)
1. "Settings" → "Domains"
2. 커스텀 도메인 추가 또는 기본 `.vercel.app` 도메인 사용

---

## 3. 배포 후 확인사항

### 3.1 Backend 확인
```bash
# API 헬스체크
curl https://<your-backend>.railway.app/api/templates/

# Admin 접속
https://<your-backend>.railway.app/admin/
```

### 3.2 Frontend 확인
1. 홈페이지 접속: `https://<your-frontend>.vercel.app`
2. 템플릿 목록 로딩 확인
3. 로그인/회원가입 기능 테스트
4. 빙고 게임 플레이 테스트

### 3.3 CORS 확인
브라우저 개발자 도구에서 네트워크 요청 확인
- CORS 에러 발생 시 백엔드 `CORS_ALLOWED_ORIGINS` 확인

---

## 4. 환경 변수 요약

### Backend (Railway)
| 변수 | 설명 | 예시 |
|------|------|------|
| `SECRET_KEY` | Django 시크릿 키 | `abc123...` |
| `DEBUG` | 디버그 모드 | `False` |
| `ALLOWED_HOSTS` | 허용 호스트 | `app.railway.app` |
| `DATABASE_URL` | DB 연결 URL | 자동 설정됨 |
| `CORS_ALLOWED_ORIGINS` | CORS 허용 도메인 | `https://app.vercel.app` |

### Frontend (Vercel)
| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_API_URL` | Backend API URL | `https://app.railway.app/api` |
| `VITE_KAKAO_JS_KEY` | 카카오맵 API 키 | `abc123...` |

---

## 5. 업데이트 배포

### 자동 배포 (추천)
- GitHub main 브랜치에 push하면 자동 배포
- Railway, Vercel 모두 GitHub 연동 시 자동 배포

### 수동 배포
```bash
# Backend
railway up

# Frontend
vercel --prod
```

---

## 6. 문제 해결

### CORS 에러
```
Access to XMLHttpRequest has been blocked by CORS policy
```
→ Backend `CORS_ALLOWED_ORIGINS`에 프론트엔드 URL 추가

### 500 Internal Server Error
1. Railway 로그 확인: "Deployments" → "View Logs"
2. `DEBUG=True`로 임시 변경하여 상세 에러 확인
3. `python manage.py check --deploy` 실행

### Static Files 404
```bash
python manage.py collectstatic --noinput
```

### Database Migration 에러
```bash
python manage.py migrate --run-syncdb
```

---

## 7. 비용

### Railway
- 무료 티어: 월 $5 크레딧 (소규모 앱에 충분)
- 유료: 사용량 기반 과금

### Vercel
- 무료 티어: 개인 프로젝트 무제한
- 유료: 팀/상업용

---

## 8. 프로덕션 체크리스트

- [ ] `SECRET_KEY` 변경됨
- [ ] `DEBUG=False` 설정됨
- [ ] `ALLOWED_HOSTS` 설정됨
- [ ] HTTPS 활성화됨
- [ ] CORS 설정 완료
- [ ] Database 백업 설정
- [ ] 에러 모니터링 설정 (선택: Sentry)
- [ ] 로그 모니터링 설정
