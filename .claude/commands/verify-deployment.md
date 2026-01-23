# Deployment Verification Command

배포 전후 테스트 검증 워크플로우를 자동화합니다.

## 실행 순서

1. **Git 상태 확인**
   - 스테이징되지 않은 변경사항 확인
   - 커밋되지 않은 변경사항 확인

2. **유닛 테스트 실행**
   ```bash
   cd backend && python manage.py test
   cd frontend && npm run test:run
   ```

3. **E2E 개발 테스트 실행**
   ```bash
   cd frontend && npm run e2e
   ```
   - 사전 조건: 로컬 개발 서버가 실행 중이어야 함

4. **배포 진행 확인**
   - 모든 테스트 통과 시 푸시 여부 확인
   ```bash
   git push origin master
   ```

5. **배포 대기**
   - Railway + Vercel 배포 완료 대기 (약 2분)

6. **E2E 프로덕션 테스트**
   ```bash
   cd frontend && npm run e2e:prod
   ```

7. **결과 요약**
   - 전체 테스트 결과 표시
   - 실패 시 원인 분석

## 사용법

```
/verify-deployment
```

## 예상 출력

```
=== Deployment Verification ===

[1/6] Git Status
  - Working directory: clean

[2/6] Unit Tests
  - Backend: 87 tests passed
  - Frontend: 59 tests passed

[3/6] E2E Dev Tests
  - 17 tests passed

[4/6] Push to Remote
  - Pushed to origin/master

[5/6] Waiting for Deployment
  - Waiting 120 seconds...

[6/6] E2E Production Tests
  - 15 tests passed

=== Verification Complete ===
All tests passed. Deployment verified successfully.
```

## 중단 조건

- 테스트 실패 시 즉시 중단
- 사용자가 푸시를 거부한 경우 중단
- 개발 서버 미실행 시 경고 후 계속 진행 여부 확인

## 관련 문서

- [DEPLOY.md](../../DEPLOY.md) - 배포 가이드
- [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) - 트러블슈팅
- [CLAUDE.md](../../CLAUDE.md) - 기능 구현 후 배포 워크플로우 섹션
