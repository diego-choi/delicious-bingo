import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useBoards, useDeleteBoard } from '../hooks/useBoards';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function MyBoardsPage() {
  const { data, isLoading, error } = useBoards();
  const deleteBoard = useDeleteBoard();
  const { confirm, ...dialogProps } = useConfirmDialog();

  const handleDelete = async (id, e) => {
    e.preventDefault();
    const confirmed = await confirm({
      title: '빙고 보드 삭제',
      message: '정말 이 빙고 보드를 삭제하시겠습니까?',
      confirmText: '삭제',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await deleteBoard.mutateAsync(id);
      } catch {
        toast.error('삭제에 실패했습니다.');
      }
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
        <p className="text-red-500">빙고 보드를 불러오는데 실패했습니다.</p>
        <p className="text-gray-500 mt-2">로그인이 필요합니다.</p>
        <Link to="/templates" className="text-brand-orange hover:underline mt-4 inline-block">
          빙고 템플릿 보기
        </Link>
      </div>
    );
  }

  const boards = data?.results || [];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">내 빙고 보드</h1>

      {boards.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">아직 시작한 빙고가 없습니다.</p>
          <Link
            to="/templates"
            className="inline-block bg-brand-orange text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-brand-orange/90 transition-colors"
          >
            빙고 도전하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="block bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition-shadow relative"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  board.is_completed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-brand-beige text-brand-orange'
                }`}>
                  {board.is_completed ? '완료' : '진행 중'}
                </span>
                <button
                  onClick={(e) => handleDelete(board.id, e)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  삭제
                </button>
              </div>
              <h2 className="font-semibold text-base sm:text-lg mb-2">{board.template_title}</h2>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p>목표: {board.target_line_count}줄</p>
                <p>완료 라인: {board.completed_lines || 0}줄</p>
                <p>진행률: {board.progress?.percentage || 0}%</p>
              </div>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-orange rounded-full h-2 transition-all"
                  style={{ width: `${board.progress?.percentage || 0}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
