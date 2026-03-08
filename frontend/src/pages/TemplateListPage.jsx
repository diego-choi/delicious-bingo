import { Link } from 'react-router-dom';
import { useTemplates } from '../hooks/useTemplates';
import { SkeletonCard } from '../components/common/Skeleton';

export default function TemplateListPage() {
  const { data, isLoading, error, refetch } = useTemplates();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display">빙고 템플릿</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">템플릿을 불러오는데 실패했습니다.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 text-brand-orange hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const templates = data?.results || [];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-display">빙고 템플릿</h1>

      {templates.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-brand-cream rounded-lg border border-brand-beige">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">
            아직 등록된 빙고 템플릿이 없습니다.
          </p>
          <button
            onClick={() => refetch()}
            className="text-brand-orange hover:underline text-sm"
          >
            새로고침
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {templates.map((template) => (
            <Link
              key={template.id}
              to={`/templates/${template.id}`}
              className="block bg-brand-cream p-4 sm:p-6 rounded-lg border border-brand-beige hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <span className="text-xs bg-brand-beige text-brand-orange px-2 py-1 rounded">
                  {template.category_name}
                </span>
              </div>
              <h2 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{template.title}</h2>
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                {template.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
