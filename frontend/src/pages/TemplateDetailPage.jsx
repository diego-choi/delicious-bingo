import { useParams, useNavigate } from 'react-router-dom';
import { useTemplate } from '../hooks/useTemplates';
import { useCreateBoard } from '../hooks/useBoards';

export default function TemplateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: template, isLoading, error } = useTemplate(id);
  const createBoard = useCreateBoard();

  const handleStartChallenge = async (targetLines) => {
    try {
      const board = await createBoard.mutateAsync({
        template: id,
        target_line_count: targetLines,
      });
      navigate(`/boards/${board.id}`);
    } catch {
      alert('빙고 보드 생성에 실패했습니다. 로그인이 필요합니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">템플릿을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 템플릿 정보 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <span className="text-xs bg-brand-beige text-brand-orange px-2 py-1 rounded">
          {template.category_name}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-3 mb-1 sm:mb-2">{template.title}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{template.description}</p>
      </div>

      {/* 맛집 목록 미리보기 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
        <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">포함된 맛집 ({template.items?.length || 0}개)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {template.items?.map((item, index) => (
            <div
              key={item.id}
              className="p-2 sm:p-3 bg-gray-50 rounded text-center text-xs sm:text-sm"
            >
              <span className="text-gray-400 text-[10px] sm:text-xs">#{index + 1}</span>
              <p className="font-medium truncate">{item.restaurant.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 도전 시작 */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">빙고 도전하기</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">목표 라인 수를 선택하세요 (최대 12줄)</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {[1, 3, 5, 12].map((lines) => (
            <button
              key={lines}
              onClick={() => handleStartChallenge(lines)}
              disabled={createBoard.isPending}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-orange text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
            >
              {lines}줄 빙고 도전
            </button>
          ))}
        </div>
        {createBoard.isPending && (
          <p className="text-gray-500 text-sm mt-3">보드 생성 중...</p>
        )}
      </div>
    </div>
  );
}
