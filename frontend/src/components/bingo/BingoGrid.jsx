import { useMemo } from 'react';
import BingoCell from './BingoCell';
import { getCompletedLines, getHighlightedPositions } from './bingoUtils';

/**
 * 빙고 그리드 컴포넌트
 * @param {Object} props
 * @param {Array} props.cells - 25개의 셀 데이터
 * @param {function} props.onCellClick - 셀 클릭 핸들러
 */
export default function BingoGrid({ cells, onCellClick }) {
  // 위치순으로 정렬된 셀
  const sortedCells = useMemo(() => {
    return [...cells].sort((a, b) => a.position - b.position);
  }, [cells]);

  // 완료된 라인 계산
  const completedLines = useMemo(() => {
    return getCompletedLines(cells);
  }, [cells]);

  // 하이라이트 할 위치
  const highlightedPositions = useMemo(() => {
    return getHighlightedPositions(completedLines);
  }, [completedLines]);

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl shadow-lg">
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {sortedCells.map((cell) => (
          <BingoCell
            key={cell.position}
            cell={cell}
            isHighlighted={highlightedPositions.has(cell.position)}
            onClick={onCellClick}
          />
        ))}
      </div>
      {completedLines.length > 0 && (
        <p className="text-center text-amber-600 font-semibold mt-3 sm:mt-4 text-sm sm:text-base">
          {completedLines.length}줄 빙고 완성!
        </p>
      )}
    </div>
  );
}
