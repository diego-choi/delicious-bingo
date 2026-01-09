import { Link } from 'react-router-dom';
import { useTemplates } from '../hooks/useTemplates';

export default function HomePage() {
  const { data, isLoading, error } = useTemplates();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 히어로 섹션 */}
      <section className="text-center py-8 sm:py-12 px-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl text-white">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">맛집 빙고</h1>
        <p className="text-base sm:text-xl mb-4 sm:mb-6">맛집 탐방을 게임처럼 즐기세요!</p>
        <Link
          to="/templates"
          className="inline-block bg-white text-amber-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-amber-50 transition-colors"
        >
          빙고 도전하기
        </Link>
      </section>

      {/* 인기 빙고 템플릿 */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">인기 빙고 템플릿</h2>
        {isLoading && <p className="text-gray-500">로딩 중...</p>}
        {error && <p className="text-red-500">템플릿을 불러오는데 실패했습니다.</p>}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.results?.slice(0, 3).map((template) => (
              <Link
                key={template.id}
                to={`/templates/${template.id}`}
                className="block bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
                <p className="text-amber-600 text-sm mt-2">
                  {template.category_name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 사용 방법 */}
      <section className="bg-white p-4 sm:p-8 rounded-lg shadow">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">어떻게 하나요?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-amber-600 font-bold text-sm sm:text-base">1</span>
            </div>
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">빙고 선택</h3>
            <p className="text-gray-600 text-xs sm:text-sm">원하는 맛집 빙고 템플릿을 선택하세요</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-amber-600 font-bold text-sm sm:text-base">2</span>
            </div>
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">맛집 방문</h3>
            <p className="text-gray-600 text-xs sm:text-sm">빙고판의 맛집을 방문하고 리뷰를 작성하세요</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-amber-600 font-bold text-sm sm:text-base">3</span>
            </div>
            <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">빙고 달성</h3>
            <p className="text-gray-600 text-xs sm:text-sm">가로, 세로, 대각선 라인을 완성하세요!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
