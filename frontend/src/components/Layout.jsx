import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/', label: '홈' },
  { path: '/templates', label: '빙고 템플릿' },
  { path: '/boards', label: '내 빙고', requiresAuth: true },
  { path: '/leaderboard', label: '리더보드' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-amber-600">
              맛집 빙고
            </Link>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-2">
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
                    <span className="text-sm text-gray-600">{user.username}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-md hover:bg-amber-600 transition-colors"
                  >
                    로그인
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            맛집 빙고 - 맛집 탐방을 게임처럼 즐기세요!
          </p>
        </div>
      </footer>
    </div>
  );
}
