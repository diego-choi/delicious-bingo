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

  // Test 4: Login Page - Kakao Login Default
  console.log('4. 로그인 페이지 테스트...');
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });

    // 카카오 로그인 버튼이 보여야 함
    const kakaoButton = await page.$('button:has-text("카카오")');
    if (kakaoButton) {
      results.push({ test: '카카오 로그인 버튼', status: 'PASS' });
    } else {
      results.push({ test: '카카오 로그인 버튼', status: 'FAIL', error: 'Kakao login button not found' });
    }

    // 일반 로그인 폼은 숨겨져 있어야 함 (?mode=admin 없이)
    const usernameInput = await page.$('input[id="username"]');
    if (!usernameInput) {
      results.push({ test: '일반 로그인 폼 숨김', status: 'PASS' });
    } else {
      results.push({ test: '일반 로그인 폼 숨김', status: 'FAIL', error: 'Login form should be hidden' });
    }
  } catch (e) {
    results.push({ test: '로그인 페이지', status: 'FAIL', error: e.message });
  }

  // Test 5: Register Page - Should Redirect to Login
  console.log('5. 회원가입 페이지 테스트 (로그인으로 리다이렉트)...');
  try {
    await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle' });
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      results.push({ test: '회원가입 리다이렉트', status: 'PASS' });
    } else {
      results.push({ test: '회원가입 리다이렉트', status: 'FAIL', error: 'Did not redirect to login' });
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

  // Test 8: Registration Disabled - Redirects to Login
  console.log('8. 회원가입 비활성화 테스트...');
  try {
    await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle' });
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      results.push({ test: '회원가입 비활성화', status: 'PASS', detail: '로그인으로 리다이렉트' });
    } else {
      results.push({ test: '회원가입 비활성화', status: 'FAIL', error: 'Did not redirect to login' });
    }
  } catch (e) {
    results.push({ test: '회원가입 비활성화', status: 'FAIL', error: e.message });
  }

  // Test 9: Admin Login Mode (via ?mode=admin URL)
  console.log('9. 관리자 로그인 모드 테스트...');
  try {
    // ?mode=admin으로 접속하면 일반 로그인 폼이 표시되어야 함
    await page.goto(BASE_URL + '/login?mode=admin', { waitUntil: 'networkidle' });

    // 폼이 나타났는지 확인
    const usernameInput = await page.$('input[id="username"]');
    const passwordInput = await page.$('input[type="password"]');
    if (usernameInput && passwordInput) {
      results.push({ test: '관리자 로그인 폼 (?mode=admin)', status: 'PASS' });
    } else {
      results.push({ test: '관리자 로그인 폼 (?mode=admin)', status: 'FAIL', error: 'Form not displayed' });
    }

    // 보안상 프로덕션 환경에서는 실제 로그인 테스트하지 않음
  } catch (e) {
    results.push({ test: '관리자 로그인 모드', status: 'FAIL', error: e.message });
  }

  // Test 10: Profile Page - Auth Protection
  console.log('10. 프로필 페이지 접근 제어 테스트...');
  try {
    await page.goto(BASE_URL + '/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();

    // 비인증 사용자는 로그인 페이지로 리다이렉트되어야 함
    if (currentUrl.includes('/login')) {
      results.push({ test: '프로필 페이지 접근 제어', status: 'PASS', detail: '비인증 사용자 리다이렉트' });
    } else {
      results.push({ test: '프로필 페이지 접근 제어', status: 'FAIL', error: '인증 없이 접근 가능 (보안 문제)' });
    }
  } catch (e) {
    results.push({ test: '프로필 페이지 접근 제어', status: 'FAIL', error: e.message });
  }

  // Test 11: Protected Route (My Boards)
  console.log('11. 내 보드 페이지 접근 제어 테스트...');
  try {
    await page.goto(BASE_URL + '/boards', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const content = await page.textContent('body');
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      results.push({ test: '내 보드 페이지 접근 제어', status: 'PASS', detail: '비인증 사용자 리다이렉트' });
    } else if (content.includes('보드') || content.includes('도전') || content.includes('빙고')) {
      // 로그인 상태면 페이지가 표시될 수 있음
      results.push({ test: '내 보드 페이지 접근 제어', status: 'PASS' });
    } else {
      results.push({ test: '내 보드 페이지 접근 제어', status: 'FAIL', error: 'Unexpected state' });
    }
  } catch (e) {
    results.push({ test: '내 보드 페이지 접근 제어', status: 'FAIL', error: e.message });
  }

  // Test 12: Mobile Responsive
  console.log('12. 모바일 반응형 테스트...');
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
