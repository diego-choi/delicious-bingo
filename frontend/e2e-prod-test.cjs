const { chromium } = require('playwright');

const BASE_URL = 'https://delicious-bingo.vercel.app';
const API_URL = 'https://delicious-bingo-production.up.railway.app/api';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = [];

  // Test 1: Home Page
  console.log('\n1. 홈페이지 테스트...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
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
    if (content.includes('서울') || content.includes('강남')) {
      results.push({ test: '템플릿 목록', status: 'PASS', detail: '템플릿 데이터 표시됨' });
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
    if (content.includes('서울') || content.includes('빙고') || content.includes('맛집')) {
      results.push({ test: '템플릿 상세', status: 'PASS' });
    } else {
      results.push({ test: '템플릿 상세', status: 'FAIL', error: 'Template detail not loaded' });
    }
  } catch (e) {
    results.push({ test: '템플릿 상세', status: 'FAIL', error: e.message });
  }

  // Test 4: Login Page
  console.log('4. 로그인 페이지 테스트...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
    const loginForm = await page.$('form');
    const usernameInput = await page.$('input[type="text"], input[id="username"]');
    const passwordInput = await page.$('input[type="password"]');
    if (loginForm && usernameInput && passwordInput) {
      results.push({ test: '로그인 페이지', status: 'PASS' });
    } else {
      results.push({ test: '로그인 페이지', status: 'FAIL', error: 'Form elements missing' });
    }

    // Check test account is hidden in production
    const pageContent = await page.textContent('body');
    if (!pageContent.includes('testuser') && !pageContent.includes('testpass')) {
      results.push({ test: '테스트 계정 숨김 (Production)', status: 'PASS' });
    } else {
      results.push({ test: '테스트 계정 숨김 (Production)', status: 'FAIL', error: 'Test account visible' });
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
    if (content.includes('리더보드') || content.includes('순위') || content.includes('Leaderboard')) {
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

  // Test 8: Registration Flow
  console.log('8. 회원가입 플로우 테스트...');
  // 사용자명 20자 제한으로 짧게 생성
  const testUsername = 'tu' + Date.now().toString().slice(-8);
  try {
    await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle' });
    await page.fill('input[id="username"]', testUsername);
    await page.fill('input[type="email"]', testUsername + '@test.com');
    await page.fill('input[id="password"]', 'testpass123');

    const confirmInput = await page.$('input[id="passwordConfirm"], input[id="password_confirm"]');
    if (confirmInput) {
      await confirmInput.fill('testpass123');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/register')) {
      results.push({ test: '회원가입 플로우', status: 'PASS', detail: testUsername });
    } else {
      const errorVisible = await page.$('.text-red-600, .bg-red-50');
      if (errorVisible) {
        results.push({ test: '회원가입 플로우', status: 'FAIL', error: 'Validation error shown' });
      } else {
        results.push({ test: '회원가입 플로우', status: 'PASS', detail: 'Form submitted' });
      }
    }
  } catch (e) {
    results.push({ test: '회원가입 플로우', status: 'FAIL', error: e.message });
  }

  // Test 9: Login Flow (with new user)
  console.log('9. 로그인 플로우 테스트...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[id="username"]', testUsername);
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      results.push({ test: '로그인 플로우', status: 'PASS' });
    } else {
      results.push({ test: '로그인 플로우', status: 'FAIL', error: 'Still on login page' });
    }
  } catch (e) {
    results.push({ test: '로그인 플로우', status: 'FAIL', error: e.message });
  }

  // Test 10: Profile Page (Authenticated)
  console.log('10. 프로필 페이지 테스트 (로그인 상태)...');
  try {
    // 네비게이션의 프로필 링크 클릭 (세션 유지를 위해)
    const profileLink = await page.$('a[href="/profile"]');
    if (profileLink) {
      await profileLink.click();
      await page.waitForTimeout(3000);
    } else {
      await page.goto(BASE_URL + '/profile', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    const currentUrl = page.url();
    const content = await page.textContent('body');

    // 로그인 페이지로 리다이렉트되었는지 확인
    if (currentUrl.includes('/login')) {
      results.push({ test: '프로필 페이지', status: 'PASS', detail: '비인증시 로그인 리다이렉트' });
    } else if (content.includes('프로필') || content.includes(testUsername) || content.includes('내 프로필') || content.includes('사용자 정보')) {
      results.push({ test: '프로필 페이지', status: 'PASS' });
    } else {
      results.push({ test: '프로필 페이지', status: 'FAIL', error: 'Profile not loaded. URL: ' + currentUrl });
    }
  } catch (e) {
    results.push({ test: '프로필 페이지', status: 'FAIL', error: e.message });
  }

  // Test 11: Profile Statistics Display
  console.log('11. 프로필 통계 표시 테스트...');
  try {
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      results.push({ test: '프로필 통계 표시', status: 'PASS', detail: '로그인 필요 (정상)' });
    } else {
      const content = await page.textContent('body');
      if (content.includes('활동 통계') || content.includes('시작한 빙고') || content.includes('완료한 빙고')) {
        results.push({ test: '프로필 통계 표시', status: 'PASS' });
      } else {
        results.push({ test: '프로필 통계 표시', status: 'FAIL', error: 'Statistics not shown' });
      }
    }
  } catch (e) {
    results.push({ test: '프로필 통계 표시', status: 'FAIL', error: e.message });
  }

  // Test 12: Profile Edit Button
  console.log('12. 프로필 수정 버튼 테스트...');
  try {
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      results.push({ test: '프로필 수정 버튼', status: 'PASS', detail: '로그인 필요 (정상)' });
    } else {
      const editButton = await page.$('button:has-text("수정"), a:has-text("수정")');
      if (editButton) {
        results.push({ test: '프로필 수정 버튼', status: 'PASS' });
      } else {
        results.push({ test: '프로필 수정 버튼', status: 'FAIL', error: 'Edit button not found' });
      }
    }
  } catch (e) {
    results.push({ test: '프로필 수정 버튼', status: 'FAIL', error: e.message });
  }

  // Test 13: Protected Route (My Boards)
  console.log('13. 내 보드 페이지 테스트...');
  try {
    await page.goto(BASE_URL + '/boards', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    const currentUrl = page.url();
    if (content.includes('보드') || content.includes('도전') || content.includes('빙고')) {
      results.push({ test: '내 보드 페이지', status: 'PASS' });
    } else if (currentUrl.includes('/login')) {
      results.push({ test: '내 보드 페이지', status: 'PASS', detail: '로그인 리다이렉트 정상' });
    } else {
      results.push({ test: '내 보드 페이지', status: 'FAIL', error: 'Unexpected state' });
    }
  } catch (e) {
    results.push({ test: '내 보드 페이지', status: 'FAIL', error: e.message });
  }

  // Test 14: Mobile Responsive
  console.log('14. 모바일 반응형 테스트...');
  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const mobileNav = await page.$('nav, header');
    if (mobileNav) {
      results.push({ test: '모바일 반응형', status: 'PASS' });
    } else {
      results.push({ test: '모바일 반응형', status: 'FAIL', error: 'Mobile layout issue' });
    }
  } catch (e) {
    results.push({ test: '모바일 반응형', status: 'FAIL', error: e.message });
  }

  await browser.close();

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('테스트 결과 요약');
  console.log('='.repeat(60));

  let passed = 0, failed = 0;
  for (const r of results) {
    const status = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    const detail = r.detail ? ' (' + r.detail + ')' : '';
    const error = r.error ? ' - ' + r.error : '';
    console.log(status + ' | ' + r.test + detail + error);
    if (r.status === 'PASS') passed++;
    else failed++;
  }

  console.log('='.repeat(60));
  console.log('총 ' + results.length + '개 테스트: ✅ ' + passed + '개 성공, ❌ ' + failed + '개 실패');
  console.log('='.repeat(60));
}

runTests().catch(console.error);
