import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/', label: '홈' },
  { path: '/templates', label: '빙고 템플릿' },
  { path: '/boards', label: '내 빙고', requiresAuth: true },
  { path: '/leaderboard', label: '리더보드' },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* 로고 */}
            <Link to="/" className="text-lg sm:text-xl font-bold text-amber-600">
              맛집 빙고
            </Link>

            {/* 데스크탑 네비게이션 */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex space-x-1 lg:space-x-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-l pl-4 ml-2">
                {isLoading ? (
                  <span className="text-gray-400 text-sm">...</span>
                ) : isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 hidden lg:inline">{user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-md hover:bg-amber-600 transition-colors"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="px-4 py-2 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t px-4 py-3">
              {isLoading ? (
                <span className="text-gray-400 text-sm">...</span>
              ) : isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 px-3">{user.username}님</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className="block px-3 py-2 text-base text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavClick}
                    className="block px-3 py-2 text-base text-center bg-amber-500 text-white font-medium rounded-md hover:bg-amber-600 transition-colors"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-xs sm:text-sm">
            맛집 빙고 - 맛집 탐방을 게임처럼 즐기세요!
          </p>
        </div>
      </footer>
    </div>
  );
}
