# Delicious Bingo 배포 트러블슈팅

프로덕션 배포 시 발생할 수 있는 문제와 해결 방법을 정리합니다.

---

## 1. Fly.io 배포 문제

### 1.1 빌드 오류

#### Frontend 빌드 실패 (Node.js stage)
**증상**: `npm run build` 실패
**원인**: `VITE_KAKAO_JS_KEY` build arg 미설정
**해결**: `fly.toml`의 `[build.args]`에 `VITE_KAKAO_JS_KEY` 설정 확인

#### Python 의존성 설치 실패
**원인**: `requirements.txt`에 없는 패키지 참조
**해결**: 로컬에서 `pip freeze > requirements.txt` 후 재배포

#### collectstatic 실패
**원인**: WhiteNoise 설정 오류 또는 STORAGES 설정 불일치
**해결**: `settings.py`의 `STORAGES` 설정 확인

### 1.2 런타임 오류

#### ALLOWED_HOSTS 오류
```
Invalid HTTP_HOST header: 'delicious-bingo.fly.dev'
```
**해결**: `fly secrets set ALLOWED_HOSTS=.fly.dev`

#### Database 연결 실패
1. `DATABASE_URL` secret 확인: `fly secrets list`
2. Supabase 대시보드에서 Connection string (URI) 확인
3. Pooler vs Direct URI 확인 (Pooler 권장)

#### 500 Internal Server Error
1. 로그 확인: `fly logs`
2. SSH 접속: `fly ssh console`
3. 배포 체크: `python manage.py check --deploy`

#### SPA 라우팅 404
**증상**: `/templates` 등 클라이언트 라우트 접근 시 404
**원인**: `frontend_dist/index.html`이 없음 (빌드 실패)
**해결**: 배포 로그에서 `npm run build` 성공 여부 확인

#### Static Files (assets) 404
**증상**: JS/CSS 파일 로드 실패
**원인**: WhiteNoise가 `frontend_dist/` 파일을 인식하지 못함
**해결**: `settings.py`에서 `WHITENOISE_ROOT = FRONTEND_DIST_DIR` 확인

### 1.3 ModuleNotFoundError: No module named 'dotenv'
**원인**: `python-dotenv`가 프로덕션에 불필요
**해결**: `settings.py`에서 선택적 import 처리 (현재 적용됨)
```python
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    pass
```

---

## 2. Cloudinary 이미지 업로드 실패

**증상**: 리뷰 이미지 업로드 시 500 에러

**확인**:
1. `CLOUDINARY_URL` 환경변수 형식 확인
2. Cloudinary 대시보드에서 API 자격 증명 확인

**올바른 형식**:
```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

---

## 3. 카카오맵 로드 실패

**증상**: 지도가 표시되지 않음

**원인**: 카카오 개발자 플랫폼에 도메인 미등록

**해결**:
1. [카카오 개발자](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 플랫폼 → Web
3. 사이트 도메인 추가:
   - 개발: `http://localhost:5173`
   - 프로덕션: `https://delicious-bingo.fly.dev`

---

## 4. 카카오 소셜 로그인 문제

### 4.1 카카오 로그인 404 오류

**증상**: `/api/auth/kakao/login/` 또는 `/api/auth/kakao/authorize/` 접근 시 404

**원인**:
1. 마이그레이션 미적용 (SocialAccount, UserProfile 모델)
2. 배포 실패로 새로운 코드가 적용되지 않음

**확인**:
```bash
fly logs
# 다음 로그가 있어야 함:
# Applying api.0002_add_social_account... OK
# Applying api.0003_add_user_profile... OK
```

**해결**:
```bash
fly ssh console
python manage.py migrate
```

### 4.2 Redirect URI 불일치 오류

**증상**: 카카오 로그인 시 "redirect_uri mismatch" 에러

**원인**: 카카오 개발자 콘솔에 Redirect URI 미등록

**해결**:
1. [카카오 개발자](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 제품 설정 → 카카오 로그인
3. **Redirect URI 등록**:
   - 개발: `http://localhost:5173/auth/kakao/callback`
   - 프로덕션: `https://delicious-bingo.fly.dev/auth/kakao/callback`

**주의**:
- URL 끝에 슬래시(`/`) 없음
- 프로토콜(`http://`, `https://`) 정확히 일치해야 함

### 4.3 카카오 인증 실패: 토큰 발급 실패

**증상**: 로그에 "카카오 인증 실패: 토큰 발급 실패" 또는 401 에러

**원인**: `KAKAO_CLIENT_SECRET` 미설정 또는 잘못된 값

**확인**:
```bash
fly secrets list
```

**해결**:
1. 카카오 개발자 콘솔 → 보안 → Client Secret 확인
2. Fly.io secret 설정:
   ```bash
   fly secrets set KAKAO_CLIENT_SECRET=<실제값>
   ```

### 4.4 사용자명이 "user"로만 표시

**증상**: 카카오 로그인 후 사용자명이 제대로 표시되지 않음

**원인**: 카카오 동의항목에서 닉네임 수집 미동의

**해결**:
1. 카카오 개발자 콘솔 → 제품 설정 → 카카오 로그인 → 동의항목
2. **닉네임**: 필수 동의로 설정
3. **프로필 이미지**: 선택 동의
4. **카카오계정(이메일)**: 선택 동의

---

## 5. 디버깅 명령어

```bash
# 로그 확인
fly logs

# SSH 접속
fly ssh console

# Django 배포 체크
python manage.py check --deploy

# 마이그레이션 상태 확인
python manage.py showmigrations

# 정적 파일 수집
python manage.py collectstatic --noinput

# 환경변수 확인
fly secrets list
```
