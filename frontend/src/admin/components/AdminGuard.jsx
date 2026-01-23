import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminGuard({ children }) {
  const { isAuthenticated, isStaff, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">접근 권한 없음</h1>
          <p className="text-gray-600 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
          <a href="/" className="text-brand-orange hover:text-brand-orange/80">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return children;
}
