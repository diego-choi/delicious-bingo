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
    <div className="bg-white p-6 rounded-xl shadow-lg">
      {/* 제목 & 상태 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${
            isCompleted
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isCompleted ? '목표 달성!' : '진행 중'}
        </span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-amber-600">{completedLines}</p>
          <p className="text-sm text-gray-500">완료 라인</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{targetLines}</p>
          <p className="text-sm text-gray-500">목표</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{activatedCells}/25</p>
          <p className="text-sm text-gray-500">방문 완료</p>
        </div>
      </div>

      {/* 목표 진행률 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">목표 달성률</span>
          <span className="font-medium text-amber-600">{lineProgress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${lineProgress}%` }}
          />
        </div>
      </div>

      {/* 방문 진행률 */}
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">맛집 방문률</span>
          <span className="font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gray-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
