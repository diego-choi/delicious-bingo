import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBoard, useCreateReview } from '../hooks/useBoards';
import BingoGrid from '../components/bingo/BingoGrid';
import BingoHeader from '../components/bingo/BingoHeader';
import CellDetailModal from '../components/modals/CellDetailModal';
import CompletionCelebration from '../components/bingo/CompletionCelebration';

export default function BoardPage() {
  const { id } = useParams();
  const { data: board, isLoading, error } = useBoard(id);
  const createReview = useCreateReview();
  const [selectedCell, setSelectedCell] = useState(null);
  const [celebration, setCelebration] = useState({ show: false, isGoalAchieved: false });

  // 활성화된 셀 수 계산
  const cells = board?.cells || [];
  const activatedCells = cells.filter((cell) => cell.is_activated).length;

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
  };

  const handleCloseModal = () => {
    setSelectedCell(null);
  };

  const handleReviewSubmit = async (formData) => {
    try {
      const result = await createReview.mutateAsync(formData);

      // 빙고 완료 체크
      if (result.bingo_completed) {
        setCelebration({
          show: true,
          isGoalAchieved: result.goal_achieved || false,
        });
      }

      // 모달 닫기
      setSelectedCell(null);
    } catch (err) {
      console.error('리뷰 등록 실패:', err);
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCloseCelebration = () => {
    setCelebration({ show: false, isGoalAchieved: false });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-500">빙고 보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">빙고 보드를 불러오는데 실패했습니다.</p>
        <Link
          to="/boards"
          className="text-amber-600 hover:underline"
        >
          내 빙고 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <BingoHeader
        title={board.template_title}
        completedLines={board.completed_lines || 0}
        targetLines={board.target_line_count}
        activatedCells={activatedCells}
        isCompleted={board.is_completed}
      />

      {/* 완료된 보드일 때 축하 다시보기 버튼 */}
      {board.is_completed && (
        <div className="text-center">
          <button
            onClick={() => setCelebration({ show: true, isGoalAchieved: true })}
            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
          >
            🎉 축하 다시보기
          </button>
        </div>
      )}

      {/* 빙고 그리드 */}
      <BingoGrid cells={cells} onCellClick={handleCellClick} />

      {/* 셀 상세 모달 */}
      {selectedCell && (
        <CellDetailModal
          cell={selectedCell}
          boardId={board.id}
          onClose={handleCloseModal}
          onReviewSubmit={handleReviewSubmit}
          isSubmitting={createReview.isPending}
        />
      )}

      {/* 빙고 완료 축하 모달 */}
      <CompletionCelebration
        isOpen={celebration.show}
        onClose={handleCloseCelebration}
        completedLines={board.completed_lines || 0}
        isGoalAchieved={celebration.isGoalAchieved}
      />

      {/* 네비게이션 */}
      <div className="text-center">
        <Link
          to="/boards"
          className="text-amber-600 hover:underline text-sm"
        >
          ← 내 빙고 목록으로
        </Link>
      </div>
    </div>
  );
}
