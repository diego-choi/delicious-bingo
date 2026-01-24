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

#### Could not find root directory: /backend
**증상**: 배포 로그에 `Could not find root directory: /backend` 오류

**원인**: Root Directory를 `/backend`로 설정 (절대 경로로 인식)

**해결**:
1. **방법 1 (권장)**: 프로젝트 루트에 `railway.json` 생성 후 Root Directory 비우기
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
2. **방법 2**: Root Directory를 `backend`로 변경 (슬래시 제거)

#### ModuleNotFoundError: No module named 'dotenv'
**증상**: 배포 시 `from dotenv import load_dotenv` 에서 오류

**원인**: `python-dotenv`가 `requirements.txt`에 없거나 프로덕션에서 불필요

**해결**: `config/settings.py`에서 선택적 import 처리
```python
# .env 파일 로드 (로컬 개발용, 프로덕션에서는 선택적)
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    # 프로덕션 환경에서는 python-dotenv가 없을 수 있음
    pass
```

**참고**: Railway는 환경변수를 직접 설정하므로 dotenv 불필요

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

## 6. 카카오 소셜 로그인 문제

### 6.1 카카오 로그인 404 오류

**증상**: `/api/auth/kakao/login/` 또는 `/api/auth/kakao/authorize/` 접근 시 404

**원인**:
1. 마이그레이션 미적용 (SocialAccount, UserProfile 모델)
2. 배포 실패로 새로운 코드가 적용되지 않음

**확인**:
```bash
# Railway 로그 확인
railway logs

# 다음 로그가 있어야 함:
# Applying api.0002_add_social_account... OK
# Applying api.0003_add_user_profile... OK
# Applying api.0004_remove_socialaccount_email_and_more... OK
```

**해결**:
1. Railway 재배포: `railway up --detach`
2. 마이그레이션 수동 실행:
   ```bash
   railway ssh
   python manage.py migrate
   ```

### 6.2 Redirect URI 불일치 오류

**증상**: 카카오 로그인 시 "redirect_uri mismatch" 에러

**원인**: 카카오 개발자 콘솔에 Redirect URI 미등록

**해결**:
1. [카카오 개발자](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 제품 설정 → 카카오 로그인
3. **Redirect URI 등록**:
   - 개발: `http://localhost:5173/auth/kakao/callback`
   - 프로덕션: `https://delicious-bingo.vercel.app/auth/kakao/callback`

**주의**:
- URL 끝에 슬래시(`/`) 없음
- 프로토콜(`http://`, `https://`) 정확히 일치해야 함

### 6.3 카카오 인증 실패: 토큰 발급 실패

**증상**: 로그에 "카카오 인증 실패: 토큰 발급 실패" 또는 401 에러

**원인**: `KAKAO_CLIENT_SECRET` 미설정 또는 잘못된 값

**확인**:
```bash
railway variables | grep KAKAO
```

**해결**:
1. 카카오 개발자 콘솔 → 보안 → Client Secret 확인
2. Railway 환경변수 설정:
   ```bash
   railway variables --set "KAKAO_CLIENT_SECRET=<실제값>"
   ```

### 6.4 사용자명이 "user"로만 표시

**증상**: 카카오 로그인 후 사용자명이 제대로 표시되지 않음

**원인**: 카카오 동의항목에서 닉네임 수집 미동의

**해결**:
1. 카카오 개발자 콘솔 → 제품 설정 → 카카오 로그인 → 동의항목
2. **닉네임**: 필수 동의로 설정
3. **프로필 이미지**: 선택 동의
4. **카카오계정(이메일)**: 선택 동의

### 6.5 비활성 계정 로그인 차단 안됨

**증상**: `is_active=False` 계정이 카카오 로그인 가능

**확인**: `views.py`의 `kakao_login_view`에 `is_active` 체크 있는지 확인
```python
if not user.is_active:
    return Response(
        {'error': '비활성화된 계정입니다.'},
        status=status.HTTP_403_FORBIDDEN
    )
```

---

## 7. 디버깅 명령어

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
