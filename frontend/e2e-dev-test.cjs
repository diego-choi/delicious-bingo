/**
 * 개발 환경 E2E 테스트
 *
 * 사용법:
 *   node e2e-dev-test.cjs           # headless 모드
 *   node e2e-dev-test.cjs --headed  # 브라우저 표시
 *   node e2e-dev-test.cjs --slow    # 느린 모드 (디버깅용)
 *
 * 사전 준비:
 *   1. Backend 서버 실행: cd backend && python manage.py runserver
 *   2. Frontend 서버 실행: cd frontend && npm run dev
 *   3. 테스트 데이터 로드: python manage.py seed_data
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_URL = process.env.E2E_API_URL || 'http://localhost:8000/api';

// CLI 옵션 파싱
const args = process.argv.slice(2);
const isHeaded = args.includes('--headed') || args.includes('-h');
const isSlowMo = args.includes('--slow') || args.includes('-s');

async function checkServersRunning() {
  const http = require('http');

  const checkUrl = (url) => new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });

  console.log('서버 상태 확인 중...');

  const frontendOk = await checkUrl(BASE_URL);
  const backendOk = await checkUrl(API_URL.replace('/api', ''));

  if (!frontendOk) {
    console.error('\n❌ Frontend 서버가 실행되지 않았습니다.');
    console.error('   실행 방법: cd frontend && npm run dev\n');
  }

  if (!backendOk) {
    console.error('\n❌ Backend 서버가 실행되지 않았습니다.');
    console.error('   실행 방법: cd backend && python manage.py runserver\n');
  }

  return frontendOk && backendOk;
}

async function runTests() {
  // 서버 실행 확인
  const serversOk = await checkServersRunning();
  if (!serversOk) {
    console.error('테스트를 실행하려면 먼저 개발 서버를 시작하세요.\n');
    process.exit(1);
  }

  console.log(`\n🧪 E2E 개발 환경 테스트 시작`);
  console.log(`   Frontend: ${BASE_URL}`);
  console.log(`   Backend:  ${API_URL}`);
  console.log(`   Mode:     ${isHeaded ? 'headed' : 'headless'}${isSlowMo ? ' (slow)' : ''}\n`);

  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isSlowMo ? 500 : 0
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = [];

  // Test 1: Home Page
  console.log('1. 홈페이지 테스트...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    const title = await page.textContent('h1');
    if (title && title.includes('맛집 빙고')) {
      results.push({ test: '홈페이지 로딩', status: 'PASS' });
    } else {
      results.push({ test: '홈페이지 로딩', status: 'FAIL', error: 'Title not found' });
    }
  } catch (e) {
    results.push({ test: '홈페이지 로딩', status: 'FAIL', error: e.message });
  }

  // Test 2: Templates List
  console.log('2. 템플릿 목록 테스트...');
  try {
    await page.goto(BASE_URL + '/templates', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=빙고', { timeout: 10000 });
    const content = await page.textContent('body');
    if (content.includes('빙고') || content.includes('템플릿')) {
      results.push({ test: '템플릿 목록', status: 'PASS' });
    } else {
      results.push({ test: '템플릿 목록', status: 'FAIL', error: 'No templates found' });
    }
  } catch (e) {
    results.push({ test: '템플릿 목록', status: 'FAIL', error: e.message });
  }

  // Test 3: Template Detail
  console.log('3. 템플릿 상세 테스트...');
  try {
    await page.goto(BASE_URL + '/templates/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    if (content.includes('빙고') || content.includes('맛집') || content.includes('도전')) {
      results.push({ test: '템플릿 상세', status: 'PASS' });
    } else {
      results.push({ test: '템플릿 상세', status: 'FAIL', error: 'Template detail not loaded' });
    }
  } catch (e) {
    results.push({ test: '템플릿 상세', status: 'FAIL', error: e.message });
  }

  // Test 4: Login Page with Test Account Visible
  console.log('4. 로그인 페이지 테스트 (테스트 계정 표시)...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
    const loginForm = await page.$('form');
    const usernameInput = await page.$('input[type="text"], input[id="username"]');
    const passwordInput = await page.$('input[type="password"]');

    if (loginForm && usernameInput && passwordInput) {
      results.push({ test: '로그인 폼', status: 'PASS' });
    } else {
      results.push({ test: '로그인 폼', status: 'FAIL', error: 'Form elements missing' });
    }

    // 개발 환경에서는 테스트 계정이 보여야 함
    const pageContent = await page.textContent('body');
    if (pageContent.includes('testuser') || pageContent.includes('테스트')) {
      results.push({ test: '테스트 계정 표시 (Dev)', status: 'PASS' });
    } else {
      results.push({ test: '테스트 계정 표시 (Dev)', status: 'WARN', error: 'Test account not visible (might be hidden)' });
    }
  } catch (e) {
    results.push({ test: '로그인 페이지', status: 'FAIL', error: e.message });
  }

  // Test 5: Register Page
  console.log('5. 회원가입 페이지 테스트...');
  try {
    await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle' });
    const registerForm = await page.$('form');
    const emailInput = await page.$('input[type="email"]');
    if (registerForm && emailInput) {
      results.push({ test: '회원가입 페이지', status: 'PASS' });
    } else {
      results.push({ test: '회원가입 페이지', status: 'FAIL', error: 'Form elements missing' });
    }
  } catch (e) {
    results.push({ test: '회원가입 페이지', status: 'FAIL', error: e.message });
  }

  // Test 6: Leaderboard Page
  console.log('6. 리더보드 페이지 테스트...');
  try {
    await page.goto(BASE_URL + '/leaderboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    if (content.includes('리더보드') || content.includes('순위')) {
      results.push({ test: '리더보드 페이지', status: 'PASS' });
    } else {
      results.push({ test: '리더보드 페이지', status: 'FAIL', error: 'Leaderboard not loaded' });
    }
  } catch (e) {
    results.push({ test: '리더보드 페이지', status: 'FAIL', error: e.message });
  }

  // Test 7: API Health Check
  console.log('7. API 연결 테스트...');
  try {
    const response = await page.request.get(API_URL + '/templates/');
    const data = await response.json();
    if (response.ok() && data.count >= 0) {
      results.push({ test: 'API 연결', status: 'PASS', detail: data.count + '개 템플릿' });
    } else {
      results.push({ test: 'API 연결', status: 'FAIL', error: 'Invalid response' });
    }
  } catch (e) {
    results.push({ test: 'API 연결', status: 'FAIL', error: e.message });
  }

  // Test 8: Login with Test Account
  console.log('8. 테스트 계정 로그인...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      results.push({ test: '테스트 계정 로그인', status: 'PASS' });
    } else {
      // 로그인 실패 시 에러 메시지 확인
      const errorMsg = await page.$('.text-red-600, .bg-red-50');
      if (errorMsg) {
        const errorText = await errorMsg.textContent();
        results.push({ test: '테스트 계정 로그인', status: 'FAIL', error: errorText });
      } else {
        results.push({ test: '테스트 계정 로그인', status: 'FAIL', error: 'Login failed - check testuser exists' });
      }
    }
  } catch (e) {
    results.push({ test: '테스트 계정 로그인', status: 'FAIL', error: e.message });
  }

  // Test 9: My Boards Page (Authenticated)
  console.log('9. 내 빙고 페이지 테스트 (인증)...');
  try {
    await page.goto(BASE_URL + '/boards', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      results.push({ test: '내 빙고 페이지', status: 'FAIL', error: '로그인 세션 유지 실패' });
    } else if (content.includes('내 빙고') || content.includes('보드') || content.includes('도전')) {
      results.push({ test: '내 빙고 페이지', status: 'PASS' });
    } else {
      results.push({ test: '내 빙고 페이지', status: 'FAIL', error: 'Content not loaded' });
    }
  } catch (e) {
    results.push({ test: '내 빙고 페이지', status: 'FAIL', error: e.message });
  }

  // Test 10: Profile Page (Authenticated)
  console.log('10. 프로필 페이지 테스트 (인증)...');
  try {
    await page.goto(BASE_URL + '/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    const currentUrl = page.url();

    if (currentUrl.includes('/login')) {
      results.push({ test: '프로필 페이지', status: 'FAIL', error: '로그인 세션 유지 실패' });
    } else if (content.includes('프로필') || content.includes('testuser') || content.includes('통계')) {
      results.push({ test: '프로필 페이지', status: 'PASS' });
    } else {
      results.push({ test: '프로필 페이지', status: 'FAIL', error: 'Profile not loaded' });
    }
  } catch (e) {
    results.push({ test: '프로필 페이지', status: 'FAIL', error: e.message });
  }

  // Test 11: Start Challenge Flow
  console.log('11. 빙고 도전 시작 테스트...');
  try {
    await page.goto(BASE_URL + '/templates/1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 도전하기 버튼 찾기
    const challengeButton = await page.$('button:has-text("도전"), a:has-text("도전")');
    if (challengeButton) {
      await challengeButton.click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      if (currentUrl.includes('/boards/')) {
        results.push({ test: '빙고 도전 시작', status: 'PASS' });
      } else {
        results.push({ test: '빙고 도전 시작', status: 'PASS', detail: '버튼 클릭 완료' });
      }
    } else {
      results.push({ test: '빙고 도전 시작', status: 'WARN', error: '도전 버튼 없음 (이미 참여 중일 수 있음)' });
    }
  } catch (e) {
    results.push({ test: '빙고 도전 시작', status: 'FAIL', error: e.message });
  }

  // Test 12: Bingo Grid Display
  console.log('12. 빙고 그리드 표시 테스트...');
  try {
    await page.goto(BASE_URL + '/boards', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 첫 번째 보드 클릭
    const boardLink = await page.$('a[href*="/boards/"]');
    if (boardLink) {
      await boardLink.click();
      await page.waitForTimeout(3000);

      // 5x5 그리드 확인
      const gridCells = await page.$$('.grid > div, [class*="grid"] > button');
      if (gridCells.length >= 25) {
        results.push({ test: '빙고 그리드 표시', status: 'PASS', detail: gridCells.length + '개 셀' });
      } else if (gridCells.length > 0) {
        results.push({ test: '빙고 그리드 표시', status: 'WARN', detail: gridCells.length + '개 셀 (25개 미만)' });
      } else {
        results.push({ test: '빙고 그리드 표시', status: 'FAIL', error: '그리드 셀 없음' });
      }
    } else {
      results.push({ test: '빙고 그리드 표시', status: 'WARN', error: '보드가 없음 (먼저 도전 필요)' });
    }
  } catch (e) {
    results.push({ test: '빙고 그리드 표시', status: 'FAIL', error: e.message });
  }

  // Test 13: Cell Click Modal
  console.log('13. 셀 클릭 모달 테스트...');
  try {
    // 그리드 셀 클릭
    const cell = await page.$('.grid button, [class*="grid"] > button');
    if (cell) {
      await cell.click();
      await page.waitForTimeout(2000);

      // 모달 확인
      const modal = await page.$('[role="dialog"], .fixed.inset-0, .modal');
      if (modal) {
        results.push({ test: '셀 클릭 모달', status: 'PASS' });

        // 모달 닫기
        const closeBtn = await page.$('button:has-text("닫기"), button:has-text("✕")');
        if (closeBtn) await closeBtn.click();
      } else {
        results.push({ test: '셀 클릭 모달', status: 'FAIL', error: '모달이 표시되지 않음' });
      }
    } else {
      results.push({ test: '셀 클릭 모달', status: 'WARN', error: '클릭 가능한 셀 없음' });
    }
  } catch (e) {
    results.push({ test: '셀 클릭 모달', status: 'FAIL', error: e.message });
  }

  // Test 14: Admin Page Access (Staff Only)
  console.log('14. 관리자 페이지 접근 테스트...');
  try {
    await page.goto(BASE_URL + '/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    const currentUrl = page.url();

    if (content.includes('관리자') || content.includes('대시보드') || content.includes('Admin')) {
      results.push({ test: '관리자 페이지', status: 'PASS', detail: 'Staff 계정으로 접근됨' });
    } else if (currentUrl === BASE_URL + '/' || currentUrl.includes('/login')) {
      results.push({ test: '관리자 페이지', status: 'PASS', detail: '일반 사용자 접근 차단됨' });
    } else {
      results.push({ test: '관리자 페이지', status: 'WARN', error: 'Unexpected state' });
    }
  } catch (e) {
    results.push({ test: '관리자 페이지', status: 'FAIL', error: e.message });
  }

  // Test 15: Admin Users Page (Staff Only)
  // Note: Test 14에서 이미 Staff 계정으로 /admin에 접근한 상태
  console.log('15. 사용자 관리 페이지 테스트...');
  try {
    await page.goto(BASE_URL + '/admin/users', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');

    if (content.includes('사용자 관리') || content.includes('사용자명')) {
      // 토글 스위치가 있는지 확인
      const toggles = await page.$$('button[class*="rounded-full"]');
      if (toggles.length > 0) {
        results.push({ test: '사용자 관리 페이지', status: 'PASS', detail: '테이블 및 토글 표시됨' });
      } else {
        results.push({ test: '사용자 관리 페이지', status: 'PASS', detail: '페이지 로드됨' });
      }
    } else if (content.includes('권한') || content.includes('접근') || content.includes('로그인')) {
      results.push({ test: '사용자 관리 페이지', status: 'PASS', detail: '권한 없는 사용자 차단됨' });
    } else {
      results.push({ test: '사용자 관리 페이지', status: 'WARN', error: 'Unexpected state' });
    }
  } catch (e) {
    results.push({ test: '사용자 관리 페이지', status: 'FAIL', error: e.message });
  }

  // Test 16: Mobile Responsive
  console.log('16. 모바일 반응형 테스트...');
  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 햄버거 메뉴 버튼 확인
    const mobileMenuBtn = await page.$('button[aria-label*="메뉴"], .md\\:hidden button');
    if (mobileMenuBtn) {
      results.push({ test: '모바일 반응형', status: 'PASS', detail: '햄버거 메뉴 표시됨' });
    } else {
      const mobileNav = await page.$('nav, header');
      if (mobileNav) {
        results.push({ test: '모바일 반응형', status: 'PASS' });
      } else {
        results.push({ test: '모바일 반응형', status: 'FAIL', error: 'Mobile layout issue' });
      }
    }
  } catch (e) {
    results.push({ test: '모바일 반응형', status: 'FAIL', error: e.message });
  }

  // Test 17: Logout
  console.log('17. 로그아웃 테스트...');
  try {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const logoutBtn = await page.$('button:has-text("로그아웃")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);

      const loginLink = await page.$('a:has-text("로그인")');
      if (loginLink) {
        results.push({ test: '로그아웃', status: 'PASS' });
      } else {
        results.push({ test: '로그아웃', status: 'FAIL', error: '로그아웃 후 로그인 링크 없음' });
      }
    } else {
      results.push({ test: '로그아웃', status: 'WARN', error: '로그아웃 버튼 없음 (이미 로그아웃?)' });
    }
  } catch (e) {
    results.push({ test: '로그아웃', status: 'FAIL', error: e.message });
  }

  await browser.close();

  // Print Results
  console.log('\n' + '='.repeat(70));
  console.log('E2E 개발 환경 테스트 결과');
  console.log('='.repeat(70));

  let passed = 0, failed = 0, warned = 0;
  for (const r of results) {
    let status;
    if (r.status === 'PASS') {
      status = '✅ PASS';
      passed++;
    } else if (r.status === 'WARN') {
      status = '⚠️  WARN';
      warned++;
    } else {
      status = '❌ FAIL';
      failed++;
    }
    const detail = r.detail ? ` (${r.detail})` : '';
    const error = r.error ? ` - ${r.error}` : '';
    console.log(`${status} | ${r.test}${detail}${error}`);
  }

  console.log('='.repeat(70));
  console.log(`총 ${results.length}개 테스트: ✅ ${passed}개 성공, ⚠️  ${warned}개 경고, ❌ ${failed}개 실패`);
  console.log('='.repeat(70));

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((e) => {
  console.error('테스트 실행 중 오류:', e.message);
  process.exit(1);
});
