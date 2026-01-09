import { memo } from 'react';

/**
 * 빙고 셀 컴포넌트
 * @param {Object} props
 * @param {Object} props.cell - 셀 데이터 (position, restaurant_name, is_activated, review)
 * @param {boolean} props.isHighlighted - 빙고 라인에 포함된 셀인지
 * @param {function} props.onClick - 셀 클릭 핸들러
 */
function BingoCell({ cell, isHighlighted = false, onClick }) {
  const { restaurant, is_activated } = cell;

  const baseClasses =
    'aspect-square p-2 rounded-lg text-center text-xs font-medium transition-all duration-200 cursor-pointer flex flex-col items-center justify-center';

  const stateClasses = is_activated
    ? 'bg-green-500 text-white shadow-md'
    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-400 hover:bg-amber-50';

  const highlightClasses = isHighlighted
    ? 'ring-2 ring-amber-500 ring-offset-1 animate-pulse'
    : '';

  return (
    <button
      type="button"
      onClick={() => onClick(cell)}
      className={`${baseClasses} ${stateClasses} ${highlightClasses}`}
    >
      <span className="line-clamp-2 leading-tight">{restaurant.name}</span>
      {is_activated && (
        <span className="mt-1 text-base">✓</span>
      )}
    </button>
  );
}

export default memo(BingoCell);
