# CLAUDE.md - Delicious Bingo

맛집 탐방을 게임화한 5x5 빙고 웹 애플리케이션. 사용자가 맛집 템플릿을 선택하고, 실제 방문 후 리뷰를 작성하면 빙고 셀이 활성화되어 목표 라인 수 달성 시 완료.

- **Frontend**: https://delicious-bingo.vercel.app
- **Backend API**: https://delicious-bingo-production.up.railway.app

---

## 개발 원칙

### 기본 원칙

1. **읽기 우선**: 코드를 수정하기 전에 반드시 기존 코드를 읽고 이해한다
2. **기존 파일 편집 우선**: 새 파일 생성보다 기존 파일 수정을 우선한다
3. **과잉 설계 금지**: 요청된 변경만 수행한다. "개선"이나 "리팩토링"을 끼워넣지 않는다
4. **최소 복잡성**: 현재 작업에 필요한 최소한의 코드만 작성한다. 유사한 코드 3줄이 성급한 추상화보다 낫다

### TDD (Test-Driven Development)

#### Red-Green-Refactor 사이클

모든 기능 추가와 버그 수정은 이 사이클을 따른다:

1. **Red**: 실패하는 테스트를 먼저 작성한다
   - 테스트가 실패하는 것을 확인한 후 다음 단계로 넘어간다
   - 테스트 이름은 `test_<행위>_<조건>_<기대결과>` 형식을 따른다
2. **Green**: 테스트를 통과하는 **최소한의** 코드를 작성한다
   - 미래 요구사항을 예측하지 않는다
   - 딱 테스트가 통과하는 만큼만 구현한다
3. **Refactor**: 모든 테스트가 통과하는 상태에서 코드 품질을 개선한다
   - 중복 제거, 네이밍 개선, 구조 정리
   - 리팩토링 후 반드시 테스트를 다시 실행한다

#### 테스트 계층

| 계층 | 위치 | 대상 | 예시 |
|------|------|------|------|
| **Backend 단위** | `backend/api/tests.py` | Service, Model, Serializer | `BingoService.check_lines()` |
| **Backend API** | `backend/api/tests.py` | ViewSet 통합 | `POST /api/reviews/` 응답 검증 |
| **Frontend 단위** | `frontend/src/**/*.test.{js,jsx}` | 컴포넌트, Hook | `BingoCell` 렌더링 |
| **E2E 개발** | `frontend/e2e-dev-test.cjs` | 전체 흐름 (로컬) | 회원가입 → 빙고 생성 → 리뷰 |
| **E2E 프로덕션** | `frontend/e2e-prod-test.cjs` | 전체 흐름 (프로덕션) | 배포 후 스모크 테스트 |

#### 버그 수정 필수 절차

1. 버그를 재현하는 테스트를 먼저 작성한다 (Red)
2. 테스트가 실패하는 것을 확인한다
3. 버그를 수정한다 (Green)
4. 회귀 방지를 위해 테스트를 유지한다

#### 테스트 작성 시점

| 상황 | 필요한 테스트 |
|------|--------------|
| API 응답 변경 | Serializer 필드 검증 테스트 |
| 비즈니스 로직 변경 | Service 레이어 단위 테스트 |
| API 엔드포인트 추가/변경 | API 통합 테스트 |
| 프론트엔드 컴포넌트 추가/변경 | 렌더링/인터랙션 테스트 |
| 버그 수정 | 버그 재현 테스트 (regression) |

### Tidy First (구조 변경과 동작 변경의 분리)

#### 핵심 원칙

**구조 변경(Tidying)과 동작 변경(Feature)은 반드시 별도 커밋으로 분리한다.**

- Tidying 커밋: 동작을 바꾸지 않으면서 코드 구조만 개선 → `Refactor:` 접두사
- Feature 커밋: 실제 기능 변경 → `Feat:`, `Fix:` 접두사
- 하나의 커밋에 구조 변경과 동작 변경을 섞지 않는다

#### Tidying 유형

1. **Guard Clauses**: 중첩 조건문을 early return으로 변환
2. **Dead Code 제거**: 사용하지 않는 코드, import, 변수 삭제
3. **변수/함수 이름 개선**: 의도를 더 명확하게 드러내는 이름으로 변경
4. **Chunk Extraction**: 긴 함수에서 의미 단위를 별도 함수로 추출
5. **순서 정리**: 관련 코드를 가까이 배치, 선언 순서 정리

#### Tidying을 하지 말아야 할 때

- 수정하지 않을 코드: 읽기만 할 파일의 스타일이 마음에 안 들어도 그대로 둔다
- 급한 버그 수정 중: 먼저 버그를 수정하고, 이후 별도로 Tidying한다
- 대규모 리팩토링: Tidying은 소규모(5분 이내)여야 한다. 대규모는 별도 작업으로 계획한다

---

## 개발 환경 실행

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Frontend
cd frontend
npm run dev

# 샘플 데이터 생성 (최초 1회)
cd backend && python manage.py seed_data
```

### 테스트 계정

| 역할 | Username | Password |
|------|----------|----------|
| 일반 사용자 | testuser | testpass123 |
| 관리자 | admin | admin1234 |

---

## 디렉토리 구조

```
delicious_bingo/
├── backend/
│   ├── api/
│   │   ├── models.py              # 데이터 모델
│   │   ├── serializers.py         # DRF Serializers
│   │   ├── serializers_admin.py   # Admin Serializers
│   │   ├── views.py               # ViewSets + Auth APIs
│   │   ├── views_admin.py         # Admin ViewSets
│   │   ├── services.py            # BingoService (라인 감지)
│   │   ├── services_oauth.py      # KakaoOAuthService (소셜 로그인)
│   │   ├── permissions.py         # IsAdminUser
│   │   ├── urls.py                # API 라우팅
│   │   ├── tests.py               # Backend 테스트
│   │   └── fixtures/initial_data.json
│   ├── config/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── Dockerfile
│   ├── start.sh
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── admin/                 # 관리자 모듈 (api/, components/, hooks/, pages/)
│   │   ├── api/                   # Axios 인스턴스 + API 함수
│   │   ├── components/            # bingo/, common/, forms/, map/, modals/, Layout
│   │   ├── contexts/              # AuthContext, AuthProvider
│   │   ├── hooks/                 # useAuth, useTemplates, useBoards 등
│   │   ├── pages/                 # 페이지 컴포넌트
│   │   ├── styles/design-tokens.css
│   │   ├── utils/cn.js
│   │   ├── constants/confetti.js
│   │   ├── router.jsx
│   │   └── main.jsx
│   ├── e2e-dev-test.cjs           # 개발 E2E 테스트
│   ├── e2e-prod-test.cjs          # 프로덕션 E2E 테스트
│   └── package.json
│
├── PRD.md                         # 제품 요구사항
├── DEPLOY.md                      # 배포 가이드 + 환경변수
├── HISTORY.md                     # 개발 히스토리
├── TROUBLESHOOTING.md             # 문제 해결
└── README.md
```

---

## 데이터 모델

```
Category (1) ──< Restaurant (N) ──< BingoTemplateItem (N) >── BingoTemplate (1)
                                                                    │
                                                                    v
User (1) ──< BingoBoard (N) ──< Review (N) >── Restaurant
  │
  ├── UserProfile (1:1)     # 사용자 프로필 (닉네임)
  └──< SocialAccount (N)    # 소셜 로그인 연동 정보
```

핵심 관계:
- `BingoBoard`는 `BingoTemplate`을 복제하여 생성 (target_line_count: 1/3/5)
- `Review` 생성 시 해당 `BingoBoard`의 셀이 활성화되고 라인 감지 실행
- 소셜 로그인 사용자의 username은 `{provider}_{provider_user_id}` 형식

---

## 빙고 라인 규칙

12개 라인 (가로 5, 세로 5, 대각선 2):
```javascript
WINNING_LINES = [
  [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],  // 가로
  [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],  // 세로
  [0,6,12,18,24], [4,8,12,16,20]  // 대각선
]
```

라인 감지 로직: `backend/api/services.py` → `BingoService.check_lines()`

---

## 테스트

```bash
# Backend
cd backend && python manage.py test

# Frontend
cd frontend && npm run test:run

# E2E 개발 (로컬 서버 실행 필요)
cd frontend && npm run e2e

# E2E 프로덕션
cd frontend && npm run e2e:prod
```

---

## 배포 워크플로우

```
1. 유닛 테스트 실행
   ├── Backend:  cd backend && python manage.py test
   └── Frontend: cd frontend && npm run test:run

2. E2E 개발 테스트 (로컬 서버 실행 상태)
   └── cd frontend && npm run e2e

3. 커밋 & 푸시
   └── git push origin master → 자동 배포 (Railway + Vercel)

4. E2E 프로덕션 테스트 (배포 후 1-2분 대기)
   └── cd frontend && npm run e2e:prod
```

**테스트 실패 시 푸시 금지**

---

## 코드 컨벤션

### 커밋 메시지
- 접두사: `Feat:`, `Fix:`, `Docs:`, `Refactor:`, `Test:`
- Tidying(구조 변경) 커밋: `Refactor:` 접두사 사용
- Feature(동작 변경) 커밋: `Feat:`, `Fix:` 접두사 사용
- Co-Authored-By 포함

### Backend
- Django/DRF 표준 패턴
- 비즈니스 로직은 `services.py`에 분리 (View에서 직접 처리하지 않음)
- 관리자 API는 `views_admin.py` / `serializers_admin.py`로 분리

### Frontend
- ESLint (react-hooks, react-refresh)
- TanStack Query로 서버 상태 관리
- Tailwind CSS 4 (`@theme` 디렉티브, `design-tokens.css`)
- 관리자 모듈은 `src/admin/`에 독립적으로 관리

---

## 관련 문서

| 문서 | 내용 |
|------|------|
| `PRD.md` | 제품 요구사항, API 명세 (6절), 데이터 모델 상세 (5절), 향후 계획 (10절) |
| `DEPLOY.md` | 배포 가이드, 환경변수 (5절), 외부 서비스 설정 (3절) |
| `HISTORY.md` | 구현 완료 기능 히스토리 |
| `TROUBLESHOOTING.md` | 배포/개발 문제 해결 |
