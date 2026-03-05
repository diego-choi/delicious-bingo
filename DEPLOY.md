# Delicious Bingo 배포 가이드

## 배포 아키텍처

```
┌─────────────────────────────────────────────┐
│           OCI ARM VM (Seoul)                │
│  ┌───────────┐     ┌────────────────────┐   │
│  │   Nginx   │────▶│  Docker (Gunicorn) │   │
│  │ (SSL/443) │     │  (Django + SPA)    │   │
│  └───────────┘     └────────────────────┘   │
└─────────────────────────────────────────────┘
        │                     │
        ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│   DuckDNS       │   │    Supabase     │
│ (무료 DNS)      │   │  (PostgreSQL)   │
└─────────────────┘   └─────────────────┘
                              │
                      ┌─────────────────┐
                      │   Cloudinary    │
                      │ (Image Storage) │
                      └─────────────────┘
```

| 서비스 | 용도 | URL |
|--------|------|-----|
| OCI ARM VM | Docker (Nginx + Django + SPA) | https://delicious-bingo.duckdns.org |
| DuckDNS | 무료 DNS | delicious-bingo.duckdns.org |
| Let's Encrypt | SSL 인증서 (Certbot 자동 갱신) | - |
| Supabase | PostgreSQL Database | - |
| Cloudinary | 이미지 저장소 | - |
| Kakao | 지도 표시 + 장소 검색 + 소셜 로그인 | - |

Django가 WhiteNoise를 통해 Vite SPA 빌드 결과물을 함께 서빙합니다 (same-origin, CORS 불필요).

---

## 1. 배포 (OCI Always Free Tier)

### 1.1 OCI 인프라 구성

1. **OCI 계정 생성**: https://www.oracle.com/cloud/free/
   - Home Region: `South Korea Central (Seoul)` — ap-seoul-1 (변경 불가)
2. **VCN 생성**: VCN Wizard → "Create VCN with Internet Connectivity"
3. **Security List**: Public Subnet에 Ingress Rule 추가 (TCP 22/80/443)
4. **ARM VM 생성**: VM.Standard.A1.Flex (2 OCPU, 12GB RAM, Ubuntu 22.04 aarch64)
5. **Reserved Public IP**: 고정 IP 할당

### 1.2 DNS 설정 (DuckDNS)

1. https://www.duckdns.org/ 가입
2. `delicious-bingo` 서브도메인 등록 → OCI Reserved IP 설정

### 1.3 VM 초기 설정

```bash
ssh -i ~/.ssh/oci_key ubuntu@<OCI-PUBLIC-IP>

# OS 방화벽 개방 (OCI Security List와 별도로 필요)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 1.4 앱 배포

```bash
# 레포지토리 클론
git clone <repo-url> ~/delicious-bingo && cd ~/delicious-bingo

# 환경 변수 설정 (.env.example 참고)
cp .env.example .env
nano .env  # 실제 값 입력

# SSL 인증서 발급 (최초 1회)
# STAGING=1로 먼저 테스트 후 STAGING=0으로 실제 발급
export LETSENCRYPT_EMAIL=your-email@example.com
export LETSENCRYPT_STAGING=1  # 테스트 시 1, 실제 발급 시 0
chmod +x init-letsencrypt.sh && ./init-letsencrypt.sh

# 앱 빌드 및 시작
docker compose up -d --build

# 초기 데이터 (최초 1회)
docker compose exec app python manage.py createsuperuser
docker compose exec app python manage.py loaddata initial_data
```

### 1.5 환경 변수 (.env)

`.env.example` 파일을 복사하여 `.env`를 생성합니다. `VITE_KAKAO_JS_KEY`는 docker-compose.yml의 build args로 전달됩니다.

> Secret Key 생성: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### 1.6 SSL 인증서 자동 갱신

```bash
chmod +x certbot-renew.sh
crontab -e
# 추가:
# 0 3 * * 1 cd ~/delicious-bingo && ./certbot-renew.sh >> /var/log/certbot-renew.log 2>&1
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

## 3. 외부 서비스 설정

### 3.1 Cloudinary
1. [Cloudinary](https://cloudinary.com) 가입
2. Dashboard에서 Cloud Name, API Key, API Secret 확인
3. Fly.io secrets에 `CLOUDINARY_URL` 설정

### 3.2 카카오 개발자

#### 애플리케이션 설정
1. [카카오 개발자](https://developers.kakao.com) → 애플리케이션 생성
2. 앱 키 확인:
   - **REST API 키** → Fly.io `KAKAO_REST_API_KEY`
   - **JavaScript 키** → `fly.toml` `VITE_KAKAO_JS_KEY` (build arg)

#### 플랫폼 설정
3. 플랫폼 → Web → 사이트 도메인 등록:
   - `http://localhost:5173` (개발)
   - `https://delicious-bingo.duckdns.org` (프로덕션)

#### 카카오 로그인 설정 (소셜 로그인용)
4. 제품 설정 → 카카오 로그인:
   - **카카오 로그인 활성화**: ON
   - **Redirect URI** 등록:
     - `http://localhost:5173/auth/kakao/callback` (개발)
     - `https://delicious-bingo.duckdns.org/auth/kakao/callback` (프로덕션)

5. 동의항목 설정:
   - **닉네임**: 필수 동의
   - **프로필 이미지**: 선택 동의
   - **카카오계정(이메일)**: 선택 동의

6. 보안 설정:
   - **Client Secret**: 활성화
   - 생성된 값을 Fly.io `KAKAO_CLIENT_SECRET`에 설정

---

## 4. 배포 확인

### API 테스트
```bash
# Health Check
curl https://delicious-bingo.duckdns.org/api/health/

# SPA 로드
curl https://delicious-bingo.duckdns.org/

# 카테고리 API
curl https://delicious-bingo.duckdns.org/api/categories/

# Cache-Control 헤더 확인 (index.html은 no-cache)
curl -I https://delicious-bingo.duckdns.org/

# Django Admin
# https://delicious-bingo.duckdns.org/django-admin/
```

### 카카오 소셜 로그인 수동 테스트
1. https://delicious-bingo.duckdns.org 접속
2. 카카오 로그인 버튼 클릭
3. 카카오 계정으로 로그인
4. 콜백 후 프로필 페이지 확인
5. 닉네임 수정 테스트

### E2E 프로덕션 테스트
```bash
cd frontend && npm run e2e:prod
```

---

## 5. 환경 변수 요약

### .env 파일 (OCI VM)
| 변수 | 필수 | 설명 |
|------|:----:|------|
| `SECRET_KEY` | O | Django 시크릿 키 |
| `DEBUG` | O | `False` |
| `ALLOWED_HOSTS` | O | `delicious-bingo.duckdns.org` |
| `DATABASE_URL` | O | Supabase PostgreSQL URI |
| `CLOUDINARY_URL` | O | 이미지 저장소 |
| `KAKAO_REST_API_KEY` | O | 카카오 REST API 키 (소셜 로그인 + 장소 검색) |
| `KAKAO_CLIENT_SECRET` | O | 카카오 Client Secret (소셜 로그인 보안) |
| `VITE_KAKAO_JS_KEY` | O | 카카오 JavaScript 키 (docker-compose build arg) |
| `SENTRY_DSN` | - | Sentry 에러 모니터링 DSN (선택) |

---

## 6. 업데이트 배포

```bash
ssh ubuntu@<OCI-PUBLIC-IP>
cd ~/delicious-bingo
git pull origin master
docker compose up -d --build
```

---

## 7. 운영 명령어

```bash
# 로그 확인
docker compose logs -f app
docker compose logs -f nginx

# 앱 재시작
docker compose restart app

# 컨테이너 상태
docker compose ps

# Django 관리 명령
docker compose exec app python manage.py <command>

# 전체 중지/시작
docker compose down
docker compose up -d
```

---

## 8. 체크리스트

### OCI 인프라
- [ ] OCI 계정 생성 (Seoul 리전)
- [ ] VCN + Public Subnet 생성
- [ ] Security List: 22/80/443 포트 개방
- [ ] ARM VM 생성 (2 OCPU, 12GB RAM)
- [ ] Reserved Public IP 할당
- [ ] OS 방화벽 (iptables) 개방
- [ ] Docker 설치

### DNS 및 SSL
- [ ] DuckDNS 서브도메인 등록
- [ ] DNS → OCI IP 확인
- [ ] Let's Encrypt 인증서 발급
- [ ] HTTPS 동작 확인
- [ ] 인증서 자동 갱신 cron 등록

### 환경 설정
- [ ] `.env` 파일 생성 (모든 환경변수)
- [ ] 카카오 플랫폼 도메인 변경 (duckdns.org)
- [ ] 카카오 Redirect URI 변경

### 배포
- [ ] `docker compose up -d --build` 성공
- [ ] Health Check 통과
- [ ] SPA 로드 확인
- [ ] 카카오 로그인 동작
- [ ] 이미지 업로드 동작
- [ ] E2E 프로덕션 테스트 통과

---

## 9. 비용

| 서비스 | 무료 티어 |
|--------|----------|
| OCI ARM VM | 4 OCPU, 24GB RAM, 200GB 스토리지 (Always Free) |
| DuckDNS | 무료 DNS |
| Let's Encrypt | 무료 SSL 인증서 |
| Supabase | 500MB DB, 1GB 대역폭/월 |
| Cloudinary | 25GB 저장, 25GB 대역폭/월 |

---

## 10. 문제 해결

배포 중 문제가 발생하면 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)를 참조하세요.

**주요 트러블슈팅:**
- Docker 빌드 실패 → `docker compose logs app` 확인
- Nginx 502 Bad Gateway → app 컨테이너 상태 확인 (`docker compose ps`)
- SSL 인증서 오류 → `certbot/conf/` 디렉토리 확인, `init-letsencrypt.sh` 재실행
- DB 연결 오류 → Supabase URI 확인 (pooler vs direct)
- 카카오 소셜 로그인 문제 → 도메인/Redirect URI 설정 확인
- Cloudinary 이미지 업로드 실패
- OCI 인스턴스 회수 → CPU 사용률 20% 이상 유지 필요

### OCI 주의사항
- **인스턴스 회수**: CPU 사용률 7일 연속 20% 미만 시 Oracle이 인스턴스를 회수할 수 있음
- **OS 방화벽**: OCI Security List와 별도로 OS 레벨 iptables도 설정 필요
- **ARM64**: 모든 Docker 이미지가 ARM64 (aarch64) 호환인지 확인
