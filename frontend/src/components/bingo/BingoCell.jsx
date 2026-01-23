import { memo } from 'react';
import { cn } from '../../utils/cn';

/**
 * 빙고 셀 컴포넌트
 * @param {Object} props
 * @param {Object} props.cell - 셀 데이터 (position, restaurant_name, is_activated, review)
 * @param {boolean} props.isHighlighted - 빙고 라인에 포함된 셀인지
 * @param {function} props.onClick - 셀 클릭 핸들러
 */
function BingoCell({ cell, isHighlighted = false, onClick }) {
  const { restaurant, is_activated, review } = cell;
  const hasImage = is_activated && review?.image;

  const baseClasses =
    'aspect-square p-1 sm:p-2 rounded-xl text-center text-[10px] sm:text-xs font-medium transition-all duration-200 cursor-pointer flex flex-col items-center justify-center overflow-hidden';

  const highlightClasses = isHighlighted
    ? 'ring-2 ring-brand-orange ring-offset-1 animate-pulse'
    : '';

  // 활성화된 셀 (이미지 있음)
  if (hasImage) {
    return (
      <button
        type="button"
        onClick={() => onClick(cell)}
        className={cn(
          baseClasses,
          'relative shadow-md',
          highlightClasses
        )}
      >
        {/* 배경 이미지 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${review.image})` }}
        />
        {/* 오렌지 오버레이 */}
        <div className="absolute inset-0 bg-brand-orange/60" />
        {/* 컨텐츠 */}
        <span className="relative z-10 text-white line-clamp-2 leading-tight break-keep drop-shadow-sm">
          {restaurant.name}
        </span>
        <span className="relative z-10 mt-0.5 sm:mt-1 text-sm sm:text-base text-white drop-shadow-sm">✓</span>
      </button>
    );
  }

  // 활성화된 셀 (이미지 없음)
  if (is_activated) {
    return (
      <button
        type="button"
        onClick={() => onClick(cell)}
        className={cn(
          baseClasses,
          'bg-brand-orange text-white shadow-md',
          highlightClasses
        )}
      >
        <span className="line-clamp-2 leading-tight break-keep">{restaurant.name}</span>
        <span className="mt-0.5 sm:mt-1 text-sm sm:text-base">✓</span>
      </button>
    );
  }

  // 비활성화된 셀
  return (
    <button
      type="button"
      onClick={() => onClick(cell)}
      className={cn(
        baseClasses,
        'bg-cell-inactive text-brand-charcoal hover:ring-2 hover:ring-brand-orange/50',
        highlightClasses
      )}
    >
      <span className="line-clamp-2 leading-tight break-keep">{restaurant.name}</span>
    </button>
  );
}

export default memo(BingoCell);
