# Fly.io → OCI Always Free Tier 이전 계획

## Context

Fly.io의 무료 티어가 사라지면서, 완전 무료인 OCI Always Free Tier로 이전하여 운영 비용을 0으로 유지한다.
현재 Fly.io (Tokyo, shared-cpu-1x, 256MB) → OCI ARM VM (Seoul, 2 OCPU, 12GB RAM)으로 대폭 성능 향상도 기대된다.

## 아키텍처 변경

```
[현재 - Fly.io]
사용자 → Fly.io CDN (HTTPS) → Docker Container (Gunicorn:8000)
                                    ↓
                              Supabase PG (Tokyo)
                              Cloudinary (이미지)

[이전 후 - OCI]
사용자 → Nginx (HTTPS/Let's Encrypt) → Docker Container (Gunicorn:8000)
              ↓                              ↓
         DuckDNS (무료 DNS)           Supabase PG (Tokyo, 유지)
                                      Cloudinary (이미지, 유지)
```

**변경되는 것**: 호스팅(Fly.io → OCI VM), 도메인(.fly.dev → .duckdns.org), SSL(자동 → Let's Encrypt)
**유지되는 것**: DB(Supabase), 이미지(Cloudinary), Kakao API, Sentry, Dockerfile

---

## Phase 1: OCI 인프라 구성 (수동, OCI 콘솔)

1. **OCI 계정 생성**: https://www.oracle.com/cloud/free/
   - Home Region: `South Korea Central (Seoul)` - ap-seoul-1 선택 (변경 불가)
2. **VCN 생성**: VCN Wizard → "Create VCN with Internet Connectivity"
3. **Security List**: Public Subnet에 Ingress Rule 추가 (TCP 22/80/443)
4. **ARM VM 생성**: VM.Standard.A1.Flex (2 OCPU, 12GB RAM, Ubuntu 22.04 aarch64)
5. **Reserved Public IP 할당**: 고정 IP 확보

## Phase 2: DNS 설정 (DuckDNS)

1. https://www.duckdns.org/ 가입 → `delicious-bingo.duckdns.org` 등록
2. OCI Reserved IP를 DuckDNS에 설정

## Phase 3: VM 환경 설정 (SSH)

```bash
# OS 방화벽 개방 (OCI Security List와 별도)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Phase 4: 새 파일 생성 (코드 변경)

### 4.1 `docker-compose.yml` (프로젝트 루트)

app(Gunicorn) + nginx(리버스 프록시/SSL) + certbot(인증서) 3개 컨테이너 구성:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_KAKAO_JS_KEY: ${VITE_KAKAO_JS_KEY}
    container_name: delicious-bingo-app
    restart: unless-stopped
    env_file:
      - .env
    expose:
      - "8000"
    networks:
      - internal

  nginx:
    image: nginx:alpine
    container_name: delicious-bingo-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - app
    networks:
      - internal

  certbot:
    image: certbot/certbot
    container_name: delicious-bingo-certbot
    volumes:
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### 4.2 `nginx/conf.d/default.conf`

```nginx
# HTTP - redirect to HTTPS + ACME challenge
server {
    listen 80;
    server_name delicious-bingo.duckdns.org;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    server_name delicious-bingo.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/delicious-bingo.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/delicious-bingo.duckdns.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://app:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 10M;
}
```

### 4.3 `init-letsencrypt.sh`

더미 인증서로 Nginx 시작 → Certbot으로 실제 인증서 발급 → Nginx 리로드
(Nginx가 인증서 없이는 시작 불가하므로 chicken-and-egg 문제 해결)

```bash
#!/bin/bash
set -e

DOMAIN="delicious-bingo.duckdns.org"
EMAIL="your-email@example.com"
STAGING=0  # 테스트 시 1로 설정 (rate limit 방지)

mkdir -p certbot/www certbot/conf nginx/conf.d

echo "### Creating dummy certificate ..."
mkdir -p certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout certbot/conf/live/$DOMAIN/privkey.pem \
  -out certbot/conf/live/$DOMAIN/fullchain.pem \
  -subj "/CN=localhost"

echo "### Starting nginx ..."
docker compose up -d nginx

echo "### Removing dummy certificate ..."
rm -rf certbot/conf/live/$DOMAIN

echo "### Requesting real certificate ..."
STAGING_ARG=""
[ $STAGING -eq 1 ] && STAGING_ARG="--staging"

docker compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email $EMAIL --agree-tos --no-eff-email \
  $STAGING_ARG -d $DOMAIN

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload
echo "### Done!"
```

### 4.4 `certbot-renew.sh` + cron

```bash
#!/bin/bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

매주 월요일 새벽 3시 자동 갱신:
```
0 3 * * 1 cd ~/delicious-bingo && ./certbot-renew.sh >> /var/log/certbot-renew.log 2>&1
```

### 4.5 `.env.example` (템플릿, 비밀값 미포함)

```bash
# Django
SECRET_KEY=
DEBUG=False
ALLOWED_HOSTS=delicious-bingo.duckdns.org

# Database (Supabase)
DATABASE_URL=

# Cloudinary
CLOUDINARY_URL=

# Kakao
KAKAO_REST_API_KEY=
KAKAO_CLIENT_SECRET=
VITE_KAKAO_JS_KEY=

# Sentry (optional)
SENTRY_DSN=
```

실제 `.env`는 OCI VM에서만 생성 (git에 포함하지 않음)

---

## Phase 5: 기존 파일 수정

| 파일 | 변경 내용 |
|------|----------|
| `frontend/e2e-prod-test.cjs` | BASE_URL을 새 도메인으로 변경 |
| `.dockerignore` | `certbot/`, `nginx/`, `.env` 추가 |
| `.gitignore` | `.env`, `certbot/conf/` 추가 |
| `DEPLOY.md` | OCI 배포 섹션 추가 |

## 코드 변경이 필요 없는 파일

| 파일 | 이유 |
|------|------|
| `Dockerfile` | ARM64 호환 (node:22-slim, python:3.12-slim 모두 ARM64 지원) |
| `backend/start.sh` | 그대로 동작 |
| `backend/config/settings.py` | 모든 설정이 환경변수 기반 (ALLOWED_HOSTS, SECURE_PROXY_SSL_HEADER 등) |
| 프론트엔드 소스 전체 | Kakao redirect URI가 `window.location.origin` 기반이라 자동 적용 |

---

## Phase 6: 외부 서비스 설정 업데이트

- **Kakao Developer Console**: 플랫폼 도메인 + Redirect URI에 `https://delicious-bingo.duckdns.org` 추가
- **Supabase/Cloudinary/Sentry**: 변경 불필요

## Phase 7: 배포 및 검증

```bash
# OCI VM에서
git clone <repo-url> ~/delicious-bingo && cd ~/delicious-bingo
nano .env                              # 환경변수 설정
chmod +x init-letsencrypt.sh && ./init-letsencrypt.sh  # SSL 인증서
docker compose up -d --build           # 앱 시작
```

### 검증 체크리스트

- [ ] `curl https://delicious-bingo.duckdns.org/api/health/` → `{"status": "ok"}`
- [ ] SPA 로딩 확인 (정적 파일 포함)
- [ ] HTTP → HTTPS 리다이렉트 동작
- [ ] 카카오 로그인 플로우 정상 동작
- [ ] 리뷰 작성 (이미지 업로드 → Cloudinary)
- [ ] E2E 프로덕션 테스트 통과

## Phase 8: 롤백 계획

1. **병행 운영**: Fly.io(`delicious-bingo.fly.dev`)와 OCI를 동시 운영 (같은 DB/스토리지 공유)
2. **OCI 확인 후**: `fly scale count 0`으로 Fly.io 머신 중지 (1개월 유지)
3. **최종 정리**: `fly apps destroy delicious-bingo`

---

## 이후 배포 워크플로우 (업데이트 시)

```bash
ssh ubuntu@<oci-ip>
cd ~/delicious-bingo
git pull origin master
docker compose up -d --build
```

## 주의사항

- **OCI 인스턴스 회수**: CPU 사용률 7일 연속 20% 미만 시 회수 가능 → health check cron으로 완화
- **Let's Encrypt 스테이징**: 초기 테스트 시 `STAGING=1`로 진행 (rate limit 방지)
- **ARM64 빌드**: 기존 Docker 이미지 모두 ARM64 지원 확인됨
- **서울↔도쿄 지연**: Supabase(Tokyo)까지 ~20-30ms, 실사용 영향 미미

## 리소스 비교

| 항목 | Fly.io (현재) | OCI (이전 후) |
|------|--------------|--------------|
| CPU | shared-cpu-1x | 2 dedicated ARM OCPUs |
| RAM | 256 MB | 12 GB |
| Cold Start | 있음 (auto_stop) | 없음 (상시 운영) |
| SSL | 자동 | Let's Encrypt (수동 초기 설정, 자동 갱신) |
| 도메인 | .fly.dev | .duckdns.org |
| 배포 | `fly deploy` | `git pull && docker compose up -d` |
| 비용 | 유료화 예정 | 완전 무료 (Always Free) |
