# Delicious Bingo 배포 가이드

## 배포 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│     Fly.io      │────▶│    Supabase     │
│   (Frontend)    │     │   (Backend)     │     │  (PostgreSQL)   │
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
| Fly.io | Backend (Django + DRF) | https://delicious-bingo.fly.dev |
| Supabase | PostgreSQL Database | - |
| Cloudinary | 이미지 저장소 | - |
| Kakao | 지도 표시 + 장소 검색 | - |

---

## 1. Backend 배포 (Fly.io)

### 1.1 사전 준비
```bash
# Fly.io CLI 설치
brew install flyctl

# 로그인
fly auth login
```

### 1.2 앱 생성 및 배포
```bash
# 앱 생성 (프로젝트 루트에서 실행)
fly apps create delicious-bingo

# 배포
fly deploy
```

`fly.toml` 설정 (프로젝트 루트):
```toml
app = 'delicious-bingo'
primary_region = 'nrt'

[build]
  dockerfile = 'backend/Dockerfile'

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = '256mb'
  cpu_kind = 'shared'
  cpus = 1
```

### 1.3 환경 변수 (Secrets)
```bash
fly secrets set \
  SECRET_KEY=<django-secret-key> \
  DEBUG=False \
  ALLOWED_HOSTS=.fly.dev \
  DATABASE_URL=<Supabase-PostgreSQL-URI> \
  CORS_ALLOWED_ORIGINS=https://delicious-bingo.vercel.app \
  CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME \
  KAKAO_REST_API_KEY=<카카오-REST-API-키> \
  KAKAO_CLIENT_SECRET=<카카오-Client-Secret>
```

**주의**: `python-dotenv`는 프로덕션에서 불필요합니다. `settings.py`에서 선택적 import 처리됨.

> Secret Key 생성: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### 1.4 초기 데이터
```bash
fly ssh console
python manage.py createsuperuser
python manage.py loaddata initial_data
```

---

## 2. Database (Supabase)

### 2.1 프로젝트 생성
1. [Supabase](https://supabase.com) → 프로젝트 생성
2. 리전: **Northeast Asia - Tokyo** (Fly.io nrt 리전과 동일)
3. Settings → Database → Connection string (URI) 복사

### 2.2 기존 데이터 마이그레이션
```bash
# 기존 DB에서 덤프
pg_dump <기존_DATABASE_URL> --no-owner --no-acl > backup.sql

# Supabase DB로 복원
psql <SUPABASE_DATABASE_URL> < backup.sql
```

---

## 3. Frontend 배포 (Vercel)

### 3.1 프로젝트 생성
1. [Vercel](https://vercel.com) → GitHub 로그인
2. "New Project" → 저장소 Import
3. Framework: Vite, Root Directory: `frontend`

### 3.2 환경 변수 (배포 전 필수 설정)
| 변수 | 값 |
|------|-----|
| `VITE_API_URL` | `https://delicious-bingo.fly.dev/api` |
| `VITE_KAKAO_JS_KEY` | `<카카오-JavaScript-키>` |

> **중요**: Vite는 빌드 시점에 환경변수를 번들에 포함하므로, 반드시 배포 전에 설정

### 3.3 자동 배포 설정

**Git Integration 연결**:
1. Settings → Git → Connect Git Repository
2. GitHub 저장소 선택

**선택적 빌드 (Ignored Build Step)**:
1. Settings → Build and Deployment → Ignored Build Step
2. Custom 선택 → `git diff --quiet HEAD^ HEAD -- .`

> frontend/ 변경 시에만 빌드 실행, 다른 파일 변경 시 스킵

---

## 4. 외부 서비스 설정

### 4.1 Cloudinary
1. [Cloudinary](https://cloudinary.com) 가입
2. Dashboard에서 Cloud Name, API Key, API Secret 확인
3. Fly.io secrets에 `CLOUDINARY_URL` 설정

### 4.2 카카오 개발자

#### 애플리케이션 설정
1. [카카오 개발자](https://developers.kakao.com) → 애플리케이션 생성
2. 앱 키 확인:
   - **REST API 키** → Fly.io `KAKAO_REST_API_KEY`
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
   - 생성된 값을 Fly.io `KAKAO_CLIENT_SECRET`에 설정

---

## 5. 배포 확인

### API 테스트
```bash
# 카테고리 API
curl https://delicious-bingo.fly.dev/api/categories/

# 카카오 로그인 URL 생성
curl "https://delicious-bingo.fly.dev/api/auth/kakao/authorize/?redirect_uri=https://delicious-bingo.vercel.app/auth/kakao/callback"
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

## 6. 환경 변수 요약

### Fly.io (Backend)
| 변수 | 필수 | 설명 |
|------|:----:|------|
| `SECRET_KEY` | O | Django 시크릿 키 |
| `DEBUG` | O | `False` |
| `ALLOWED_HOSTS` | O | `.fly.dev` |
| `DATABASE_URL` | O | Supabase PostgreSQL URI |
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

## 7. 업데이트 배포

### Backend (Fly.io)
```bash
fly deploy
```

### Frontend (Vercel)
```bash
git push origin master
# → Vercel 자동 빌드 및 배포
```

### 수동 배포 (Frontend)
```bash
cd frontend && vercel --prod
```

---

## 8. 운영 명령어

```bash
# 로그 확인
fly logs

# SSH 접속
fly ssh console

# 앱 상태 확인
fly status

# 머신 목록
fly machine list

# 스케일링
fly scale memory 512
```

---

## 9. 체크리스트

### 환경 설정
- [ ] Supabase 프로젝트 생성 (Tokyo 리전)
- [ ] 기존 DB → Supabase 마이그레이션
- [ ] `SECRET_KEY` 설정
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` 설정
- [ ] `DATABASE_URL` 설정 (Supabase URI)
- [ ] `CORS_ALLOWED_ORIGINS` 설정
- [ ] `CLOUDINARY_URL` 설정
- [ ] `KAKAO_REST_API_KEY` 설정
- [ ] `KAKAO_CLIENT_SECRET` 설정
- [ ] 카카오 플랫폼 도메인 등록
- [ ] 카카오 Redirect URI 등록
- [ ] 카카오 동의항목 설정

### 배포
- [ ] Fly.io 앱 생성
- [ ] `fly deploy` 성공
- [ ] Vercel `VITE_API_URL` 업데이트 → Redeploy
- [ ] API 테스트 통과
- [ ] E2E 프로덕션 테스트 통과

---

## 10. 비용

| 서비스 | 무료 티어 |
|--------|----------|
| Fly.io | 3 shared-cpu-1x VMs, 256MB RAM 각각 |
| Supabase | 500MB DB, 1GB 대역폭/월 |
| Vercel | 개인 프로젝트 무제한 |
| Cloudinary | 25GB 저장, 25GB 대역폭/월 |

---

## 11. 문제 해결

배포 중 문제가 발생하면 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참조하세요.

**주요 트러블슈팅:**
- Fly.io 배포 실패 → `fly logs` 확인
- DB 연결 오류 → Supabase URI 확인 (pooler vs direct)
- dotenv import 오류
- 카카오 소셜 로그인 문제
- CORS 에러
- Cloudinary 이미지 업로드 실패
