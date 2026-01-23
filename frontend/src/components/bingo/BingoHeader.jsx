/**
 * 빙고 보드 헤더 컴포넌트
 * 진행률, 완료 라인, 목표를 표시
 * @param {Object} props
 * @param {string} props.title - 빙고 템플릿 제목
 * @param {number} props.completedLines - 완료된 라인 수
 * @param {number} props.targetLines - 목표 라인 수
 * @param {number} props.activatedCells - 활성화된 셀 수
 * @param {boolean} props.isCompleted - 목표 달성 여부
 */
export default function BingoHeader({
  title,
  completedLines,
  targetLines,
  activatedCells,
  isCompleted,
}) {
  const progress = Math.round((activatedCells / 25) * 100);
  const lineProgress = Math.min(Math.round((completedLines / targetLines) * 100), 100);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      {/* 제목 & 상태 */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h1 className="text-base sm:text-xl font-bold text-brand-charcoal truncate pr-2">{title}</h1>
        <span
          className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap ${
            isCompleted
              ? 'bg-green-100 text-green-700'
              : 'bg-brand-beige text-brand-orange'
          }`}
        >
          {isCompleted ? '목표 달성!' : '진행 중'}
        </span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 bg-brand-beige rounded-lg p-3">
        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-bold text-brand-orange">{completedLines}</p>
          <p className="text-xs sm:text-sm text-gray-500">완료 라인</p>
        </div>
        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-bold text-brand-charcoal">{targetLines}</p>
          <p className="text-xs sm:text-sm text-gray-500">목표</p>
        </div>
        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-bold text-brand-charcoal">{activatedCells}/25</p>
          <p className="text-xs sm:text-sm text-gray-500">방문 완료</p>
        </div>
      </div>

      {/* 목표 진행률 */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">목표 달성률</span>
          <span className="font-medium text-brand-orange">{lineProgress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-brand-orange'
            }`}
            style={{ width: `${lineProgress}%` }}
          />
        </div>
      </div>

      {/* 방문 진행률 */}
      <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">맛집 방문률</span>
          <span className="font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="h-full bg-gray-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
