# Fly.io → OCI Always Free Tier 이전 계획

## Context

Fly.io의 무료 티어가 사라지면서, 완전 무료인 OCI Always Free Tier로 이전하여 운영 비용을 0으로 유지한다.
현재 Fly.io (Tokyo, shared-cpu-1x, 256MB) → OCI x86 VM (Chuncheon, E2.1.Micro, 1GB RAM)으로 이전.

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

## Phase 1: OCI 인프라 구성 ✅ 완료

1. ✅ **OCI 계정 생성**: Home Region: `South Korea (Chuncheon)` - ap-chuncheon-1
2. ✅ **VCN 생성**: VCN Wizard → "Create VCN with Internet Connectivity"
3. ✅ **Security List**: Public Subnet에 Ingress Rule 추가 (TCP 22/80/443)
4. ✅ **x86 VM 생성**: VM.Standard.E2.1.Micro (1/8 OCPU, 1GB RAM, Ubuntu 22.04 amd64)
   - ARM VM (A1.Flex)은 Seoul/Chuncheon 모두 용량 부족으로 생성 불가
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

## Phase 4: 배포 방식 (Docker Hub 경유)

VM이 1GB RAM이라 Docker 빌드가 불가하므로, 로컬에서 빌드 후 Docker Hub에 push하는 방식으로 배포.

### 로컬에서 이미지 빌드 & push
```bash
VITE_KAKAO_JS_KEY=<카카오-JS-키> ./deploy.sh
```

### OCI VM에서 이미지 pull & 실행
```bash
docker compose pull && docker compose up -d
```

## Phase 5: 기존 파일 수정 ✅ 완료

| 파일 | 변경 내용 |
|------|----------|
| `docker-compose.yml` | VM 빌드 → Docker Hub 이미지 pull 방식으로 변경 |
| `deploy.sh` | 로컬 빌드 + Docker Hub push 스크립트 (신규) |
| `frontend/e2e-prod-test.cjs` | BASE_URL을 환경변수 기반으로 변경 |
| `.dockerignore` | `certbot/`, `nginx/`, `.env` 추가 |
| `.gitignore` | `certbot/conf/` 추가 |
| `DEPLOY.md` | OCI 배포 가이드로 전면 교체 |
| `CLAUDE.md` | URL을 duckdns.org로 변경 |

## Phase 6: 외부 서비스 설정 업데이트

- **Kakao Developer Console**: 플랫폼 도메인 + Redirect URI에 `https://delicious-bingo.duckdns.org` 추가
- **Supabase/Cloudinary/Sentry**: 변경 불필요

## Phase 7: 배포 및 검증

```bash
# OCI VM에서
git clone <repo-url> ~/delicious-bingo && cd ~/delicious-bingo
cp .env.example .env && nano .env       # 환경변수 설정
chmod +x init-letsencrypt.sh && ./init-letsencrypt.sh  # SSL 인증서
docker compose pull && docker compose up -d             # 앱 시작
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
# 1. 로컬에서 이미지 빌드 & push
VITE_KAKAO_JS_KEY=<카카오-JS-키> ./deploy.sh

# 2. OCI VM에서 pull & 재시작
ssh ubuntu@<oci-ip>
cd ~/delicious-bingo
git pull origin master
docker compose pull && docker compose up -d
```

## 주의사항

- **OCI 인스턴스 회수**: CPU 사용률 7일 연속 20% 미만 시 회수 가능 → health check cron으로 완화
- **Let's Encrypt 스테이징**: 초기 테스트 시 `STAGING=1`로 진행 (rate limit 방지)
- **1GB RAM 제약**: VM에서 Docker 빌드 불가, 반드시 로컬에서 빌드 후 Docker Hub에 push
- **춘천↔도쿄 지연**: Supabase(Tokyo)까지 ~30-40ms, 실사용 영향 미미

## 리소스 비교

| 항목 | Fly.io (이전) | OCI (이후) |
|------|--------------|-----------|
| CPU | shared-cpu-1x | 1/8 OCPU (E2.1.Micro) |
| RAM | 256 MB | 1 GB |
| Cold Start | 있음 (auto_stop) | 없음 (상시 운영) |
| SSL | 자동 | Let's Encrypt (자동 갱신) |
| 도메인 | .fly.dev | .duckdns.org |
| 배포 | `fly deploy` | `deploy.sh` + `docker compose pull` |
| 비용 | 유료화 | 완전 무료 (Always Free) |
