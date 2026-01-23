# Delicious Bingo 배포 트러블슈팅

프로덕션 배포 시 발생할 수 있는 문제와 해결 방법을 정리합니다.

---

## 1. Railway (Backend) 문제

### 1.1 빌드 오류

#### Nixpacks pip not found
```
/bin/bash: line 1: pip: command not found
```
**원인**: Nixpacks 빌더가 pip을 찾지 못함
**해결**: 프로젝트에 Dockerfile이 있으면 Railway가 자동으로 Docker 빌더 사용. `railway.json`이 있다면 삭제.

#### $PORT 환경변수 오류
```
Error: '$PORT' is not a valid port number.
```
**원인**: `railway.json`의 `startCommand`에서 `$PORT`가 문자열로 전달됨
**해결**: `railway.json` 삭제 → Dockerfile + start.sh 사용

#### Python/Django 버전 불일치
```
Django==6.0.1 Requires-Python >=3.12
```
**해결**: Dockerfile에서 `FROM python:3.12-slim` 사용

#### 로그 없이 Crashed 상태
**원인**: Root Directory 미설정으로 Dockerfile을 찾지 못함
**해결**: Settings → General → Root Directory: `backend`

### 1.2 런타임 오류

#### ALLOWED_HOSTS 오류
```
Invalid HTTP_HOST header: 'xxx.up.railway.app'
```
**해결**: 환경변수 `ALLOWED_HOSTS=.railway.app` (앞에 점 포함)

#### Database 연결 실패
1. PostgreSQL 서비스가 생성되었는지 확인
2. 백엔드 서비스의 Variables에서 PostgreSQL 서비스 연결 (Reference)
3. `DATABASE_URL`이 자동 설정되었는지 확인

#### 500 Internal Server Error
1. Railway 로그 확인: "Deployments" → "View Logs"
2. `DEBUG=True`로 임시 변경하여 상세 에러 확인
3. `python manage.py check --deploy` 실행

#### Static Files 404
```bash
python manage.py collectstatic --noinput
```

#### Database Migration 에러
```bash
python manage.py migrate --run-syncdb
```

---

## 2. Vercel (Frontend) 문제

### 2.1 자동 배포 미작동

**증상**: `git push` 해도 자동 배포가 안됨

**원인**: Git Integration이 연결되지 않음

**확인**:
```bash
# GitHub 웹훅 확인 (Vercel 웹훅이 있어야 함)
gh api repos/<owner>/<repo>/hooks
```

**해결**:
1. Vercel Dashboard → 프로젝트 → Settings → Git
2. Connected Git Repository 섹션 확인
3. 연결되지 않은 경우 **Connect Git Repository** 클릭
4. GitHub 저장소 선택 후 연결

### 2.2 API 호출이 localhost로 감

**증상**:
```
GET http://localhost:8000/api/templates/ net::ERR_CONNECTION_REFUSED
```

**원인**: `VITE_API_URL` 환경변수가 빌드에 포함되지 않음

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `VITE_API_URL` 추가 (Production 환경)
3. Redeploy 실행

> **중요**: Vite는 빌드 시점에 환경변수를 번들에 포함하므로, 환경변수 변경 후 반드시 재배포 필요

---

## 3. CORS 에러

**증상**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결**: Railway 환경변수에서 `CORS_ALLOWED_ORIGINS`에 프론트엔드 URL 추가
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

---

## 4. Cloudinary 이미지 업로드 실패

**증상**: 리뷰 이미지 업로드 시 500 에러

**확인**:
1. `CLOUDINARY_URL` 환경변수 형식 확인
2. Cloudinary 대시보드에서 API 자격 증명 확인

**올바른 형식**:
```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

---

## 5. 카카오맵 로드 실패

**증상**: 지도가 표시되지 않음

**원인**: 카카오 개발자 플랫폼에 도메인 미등록

**해결**:
1. [카카오 개발자](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 플랫폼 → Web
3. 사이트 도메인 추가:
   - 개발: `http://localhost:5173`
   - 프로덕션: `https://delicious-bingo.vercel.app`

---

## 6. 디버깅 명령어

### Railway SSH 접속
```bash
railway ssh
```

### Django 배포 체크
```bash
python manage.py check --deploy
```

### 마이그레이션 상태 확인
```bash
python manage.py showmigrations
```

### 정적 파일 수집
```bash
python manage.py collectstatic --noinput
```

### 환경변수 확인
```bash
# Railway
railway variables

# Vercel
vercel env ls
```
