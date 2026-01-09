import { useRouteError, Link } from 'react-router-dom';

/**
 * 에러 페이지 컴포넌트
 * React Router의 errorElement로 사용
 */
export default function ErrorPage() {
  const error = useRouteError();

  const is404 = error?.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">
          {is404 ? '🔍' : '😵'}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {is404 ? '페이지를 찾을 수 없습니다' : '문제가 발생했습니다'}
        </h1>
        <p className="text-gray-600 mb-6">
          {is404
            ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
            : '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
