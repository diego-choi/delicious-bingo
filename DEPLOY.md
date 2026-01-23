# Delicious Bingo 배포 가이드

## 아키텍처 개요

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│    Railway      │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
│   React + Vite  │     │  Django + DRF   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Kakao Maps    │     │   Cloudinary    │
│   (지도 표시)    │     │ (Image Storage) │
└─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Kakao Local   │
                        │  (장소 검색)     │
                        └─────────────────┘
```

- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Django + Gunicorn)
- **Database**: Railway PostgreSQL
- **Image Storage**: Cloudinary
- **Map & Search**: Kakao Developers (지도 표시 + 관리자 장소 검색)

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
3. **Root Directory 설정 (중요!)**:
   - Settings → General → Root Directory: `backend` 입력
   - 이 설정이 없으면 Dockerfile을 찾지 못해 배포 실패
4. 환경 변수 설정 (Variables 탭):

```bash
# 필수 환경 변수
SECRET_KEY=<생성한-시크릿-키>
DEBUG=False
ALLOWED_HOSTS=.railway.app
DATABASE_URL=<PostgreSQL-URL>  # PostgreSQL 서비스 연결 시 자동 설정
CORS_ALLOWED_ORIGINS=https://<your-frontend>.vercel.app
CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@<CLOUD_NAME>

# 시크릿 키 생성 (터미널에서 실행)
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

> **참고**: `ALLOWED_HOSTS=.railway.app`은 모든 Railway 서브도메인 허용 (예: `xxx.up.railway.app`)

5. "Deploy" 클릭
6. 배포 완료 후 "Settings" → "Networking" → "Generate Domain" 클릭

### 1.4 초기 데이터 설정
Railway SSH 접속 후 실행:
```bash
# SSH 접속
railway ssh

# 슈퍼유저 생성
python manage.py createsuperuser

# 초기 데이터 로드 (카테고리, 맛집, 템플릿)
python manage.py loaddata initial_data
```

---

## 2. Cloudinary 설정 (이미지 저장소)

Railway 컨테이너는 휘발성 파일시스템이므로, 리뷰 이미지는 Cloudinary에 저장됩니다.

### 2.1 Cloudinary 계정 생성
1. [Cloudinary](https://cloudinary.com) 접속
2. 회원가입 (무료 티어: 25GB 저장, 25GB 대역폭/월)

### 2.2 API 자격 증명 확인
1. Dashboard 접속
2. 다음 정보 확인:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2.3 CLOUDINARY_URL 형식
```
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

예시:
```
cloudinary://123456789012345:abcDEFghiJKLmnoPQRstu-vwxyz@my-cloud-name
```

### 2.4 Railway 환경변수 등록
Railway Dashboard → 프로젝트 → Variables:
```
CLOUDINARY_URL=cloudinary://...
```

> **참고**: `CLOUDINARY_URL`이 설정되지 않으면 로컬 파일시스템을 사용합니다 (개발 환경용).

---

## 3. 카카오 개발자 설정

카카오맵 표시와 관리자 장소 검색을 위해 카카오 개발자 설정이 필요합니다.

### 3.1 카카오 개발자 계정 생성
1. [카카오 개발자](https://developers.kakao.com) 접속
2. 카카오 계정으로 로그인

### 3.2 애플리케이션 생성
1. "내 애플리케이션" → "애플리케이션 추가하기"
2. 앱 이름 입력 (예: "맛집 빙고")
3. 저장

### 3.3 API 키 확인
"앱 키" 섹션에서 두 가지 키 확인:

| 키 종류 | 용도 | 설정 위치 |
|--------|------|----------|
| **REST API 키** | 관리자 장소 검색 (백엔드) | Railway `KAKAO_REST_API_KEY` |
| **JavaScript 키** | 지도 표시 (프론트엔드) | Vercel `VITE_KAKAO_JS_KEY` |

### 3.4 플랫폼 등록 (중요!)
1. 좌측 메뉴 "플랫폼" 클릭
2. "Web" 플랫폼 등록
3. **사이트 도메인** 추가:
   - 개발: `http://localhost:5173`
   - 프로덕션: `https://delicious-bingo.vercel.app`

> **주의**: 도메인 등록 없이는 지도가 로드되지 않습니다.

### 3.5 환경변수 설정
```bash
# Railway (Backend)
railway variables set KAKAO_REST_API_KEY=<REST-API-키>

# Vercel (Frontend) - 대시보드에서 설정 권장
VITE_KAKAO_JS_KEY=<JavaScript-키>
```

---

## 4. Frontend 배포 (Vercel)

### 4.1 Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 로그인

### 4.2 프로젝트 배포
1. "New Project" 클릭
2. `delicious_bingo` 저장소 Import
3. Framework Preset: "Vite" 선택
4. Root Directory: `frontend` 입력
5. **환경 변수 설정 (중요!):**
   - Settings → Environment Variables에서 설정
   - **반드시 배포 전에 설정해야 함** (Vite는 빌드 시점에 환경변수를 번들에 포함)

| 변수 | 값 | Environment |
|------|------|-------------|
| `VITE_API_URL` | `https://<your-backend>.railway.app/api` | Production |
| `VITE_KAKAO_JS_KEY` | `<카카오-API-키>` (선택) | Production |

> **주의**: CLI로 `-e` 옵션을 전달해도 빌드에 반영되지 않음. 반드시 대시보드에서 설정!

6. "Deploy" 클릭

### 4.3 Git Integration 설정 (자동 배포)

Vercel에서 `git push` 시 자동 배포를 위해 Git Integration 설정이 필요합니다.

> **중요**: 초기 프로젝트 Import 시 GitHub 저장소를 선택했더라도, Git Integration이 자동으로 활성화되지 않을 수 있습니다. 아래 단계를 통해 명시적으로 연결해야 합니다.

#### Step 1: Root Directory 설정
1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Build and Deployment**
3. **Root Directory** 섹션에서 `frontend` 입력
4. **Save** 클릭

#### Step 2: Git 저장소 연결
1. **Settings** → **Git**
2. **Connected Git Repository** 섹션 확인
3. 연결되지 않은 경우 **Connect Git Repository** 클릭
4. GitHub 저장소 (`diego-choi/delicious-bingo`) 선택
5. **Connect** 클릭

#### Step 3: 연결 확인
```bash
# 테스트 커밋으로 자동 배포 확인
git commit --allow-empty -m "Test: Vercel auto-deploy"
git push origin master

# 30초 후 Vercel 배포 목록 확인
cd frontend && vercel ls --yes
```

새 배포가 생성되고 URL에 `git-master`가 포함되어 있으면 성공:
```
https://project-git-master-username.vercel.app
```

#### Git Integration vs Deploy Hook

| 방식 | 트리거 | 용도 |
|------|--------|------|
| **Git Integration** | `git push` 시 자동 | 일반적인 개발 워크플로우 (권장) |
| **Deploy Hook** | URL 호출 시 수동 | CMS 연동, 외부 시스템 연동 |

> **참고**: Deploy Hook은 Git Integration과 별개입니다. 자동 배포만 필요하면 Deploy Hook은 생성하지 않아도 됩니다.

### 4.4 도메인 설정 (선택)
1. "Settings" → "Domains"
2. 커스텀 도메인 추가 또는 기본 `.vercel.app` 도메인 사용

---

## 5. 배포 후 확인사항

### 5.1 Backend 확인
```bash
# API 헬스체크
curl https://<your-backend>.railway.app/api/templates/

# Admin 접속
https://<your-backend>.railway.app/admin/
```

### 5.2 Frontend 확인
1. 홈페이지 접속: `https://<your-frontend>.vercel.app`
2. 템플릿 목록 로딩 확인
3. 로그인/회원가입 기능 테스트
4. 빙고 게임 플레이 테스트

### 5.3 CORS 확인
브라우저 개발자 도구에서 네트워크 요청 확인
- CORS 에러 발생 시 백엔드 `CORS_ALLOWED_ORIGINS` 확인

---

## 6. 환경 변수 요약

### Backend (Railway)
| 변수 | 필수 | 설명 | 예시 |
|------|:----:|------|------|
| `SECRET_KEY` | O | Django 시크릿 키 | `django-insecure-xxx...` |
| `DEBUG` | O | 디버그 모드 | `False` |
| `ALLOWED_HOSTS` | O | 허용 호스트 (점으로 시작) | `.railway.app` |
| `DATABASE_URL` | O | DB 연결 URL | PostgreSQL 연결 시 자동 설정 |
| `CORS_ALLOWED_ORIGINS` | O | CORS 허용 도메인 | `https://xxx.vercel.app` |
| `CLOUDINARY_URL` | O | Cloudinary 연결 URL | `cloudinary://API_KEY:SECRET@CLOUD_NAME` |
| `KAKAO_REST_API_KEY` | - | 카카오 REST API 키 (관리자 검색) | `abc123...` |

### Frontend (Vercel)
| 변수 | 필수 | 설명 | 예시 |
|------|:----:|------|------|
| `VITE_API_URL` | O | Backend API URL | `https://xxx.railway.app/api` |
| `VITE_KAKAO_JS_KEY` | - | 카카오 JavaScript 키 (지도) | `abc123...` |

> **중요**: Vercel 환경변수는 반드시 대시보드에서 설정해야 빌드에 반영됨

---

## 7. 업데이트 배포

### 자동 배포 (추천)

GitHub에 push하면 Railway와 Vercel 모두 자동 배포됩니다.

```bash
git add -A
git commit -m "Feat: 새 기능 추가"
git push origin master
# → Railway: 자동 빌드 및 배포
# → Vercel: 자동 빌드 및 배포
```

#### 자동 배포 전제 조건

| 플랫폼 | 필수 설정 | 확인 방법 |
|--------|----------|----------|
| **Railway** | GitHub Repo 연결 | Settings → Source 확인 |
| **Vercel** | Git Integration 연결 | Settings → Git → Connected Git Repository 확인 |

> **주의**: Vercel은 초기 Import 후에도 Git Integration이 연결되지 않을 수 있습니다. [4.3 Git Integration 설정](#43-git-integration-설정-자동-배포) 참조.

### 수동 배포

자동 배포가 실패하거나 즉시 배포가 필요한 경우:

```bash
# Backend (Railway)
cd backend && railway up

# Frontend (Vercel)
cd frontend && vercel --prod
```

---

## 8. 문제 해결

### 8.1 Railway 빌드 오류

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

---

### 8.2 Railway 런타임 오류

#### ALLOWED_HOSTS 오류
```
Invalid HTTP_HOST header: 'xxx.up.railway.app'
```
**해결**: 환경변수 `ALLOWED_HOSTS=.railway.app` (앞에 점 포함)

#### Database 연결 실패
1. PostgreSQL 서비스가 생성되었는지 확인
2. 백엔드 서비스의 Variables에서 PostgreSQL 서비스 연결 (Reference)
3. `DATABASE_URL`이 자동 설정되었는지 확인

---

### 8.3 Vercel 오류

#### git push 해도 자동 배포가 안됨
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

#### API 호출이 localhost로 감
```
GET http://localhost:8000/api/templates/ net::ERR_CONNECTION_REFUSED
```
**원인**: `VITE_API_URL` 환경변수가 빌드에 포함되지 않음
**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `VITE_API_URL` 추가 (Production 환경)
3. Redeploy 실행

---

### 8.4 CORS 에러
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**해결**: Railway 환경변수에서 `CORS_ALLOWED_ORIGINS`에 프론트엔드 URL 추가
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

---

### 8.5 기타

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

## 9. 비용

### Railway
- 무료 티어: 월 $5 크레딧 (소규모 앱에 충분)
- 유료: 사용량 기반 과금

### Vercel
- 무료 티어: 개인 프로젝트 무제한
- 유료: 팀/상업용

### Cloudinary
- 무료 티어: 25GB 저장, 25GB 대역폭/월
- 유료: 사용량 기반 과금

---

## 10. 프로덕션 체크리스트

### 환경 설정
- [ ] `SECRET_KEY` 변경됨
- [ ] `DEBUG=False` 설정됨
- [ ] `ALLOWED_HOSTS` 설정됨
- [ ] HTTPS 활성화됨
- [ ] CORS 설정 완료
- [ ] Cloudinary 설정 완료 (`CLOUDINARY_URL`)
- [ ] 카카오 개발자 플랫폼 도메인 등록 (관리자 지도 사용 시)

### 자동 배포 설정
- [ ] Railway: GitHub 저장소 연결됨
- [ ] Railway: Root Directory `backend` 설정됨
- [ ] Vercel: Git Integration 연결됨 (Settings → Git)
- [ ] Vercel: Root Directory `frontend` 설정됨 (Settings → Build and Deployment)
- [ ] 자동 배포 테스트 완료 (`git push` → 배포 확인)

### 운영
- [ ] Database 백업 설정
- [ ] 에러 모니터링 설정 (선택: Sentry)
- [ ] 로그 모니터링 설정
