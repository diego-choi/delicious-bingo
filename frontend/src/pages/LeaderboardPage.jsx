import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';

export default function LeaderboardPage() {
  const { data, isLoading, error } = useLeaderboard();
  const [activeTab, setActiveTab] = useState('fastest');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-500">리더보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">리더보드를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-amber-600 hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const { fastest_completions = [], most_completions = [] } = data || {};

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">리더보드</h1>

      {/* 탭 버튼 */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6">
        <button
          onClick={() => setActiveTab('fastest')}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            activeTab === 'fastest'
              ? 'bg-white text-amber-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          최단 시간 클리어
        </button>
        <button
          onClick={() => setActiveTab('most')}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            activeTab === 'most'
              ? 'bg-white text-amber-600 shadow'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          최다 완료
        </button>
      </div>

      {/* 최단 시간 클리어 순위 */}
      {activeTab === 'fastest' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">⚡</span>
              최단 시간 클리어
            </h2>
          </div>

          {fastest_completions.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
              아직 완료된 빙고가 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {fastest_completions.map((item) => (
                <div
                  key={`${item.username}-${item.completed_at}`}
                  className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    item.rank === 1
                      ? 'bg-yellow-100 text-yellow-600'
                      : item.rank === 2
                      ? 'bg-gray-100 text-gray-600'
                      : item.rank === 3
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{item.username}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{item.template_title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-amber-600 text-sm sm:text-base">{item.completion_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 최다 완료 순위 */}
      {activeTab === 'most' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
              <span className="text-lg sm:text-xl">🏆</span>
              최다 완료
            </h2>
          </div>

          {most_completions.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
              아직 완료된 빙고가 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {most_completions.map((item) => (
                <div
                  key={item.username}
                  className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    item.rank === 1
                      ? 'bg-yellow-100 text-yellow-600'
                      : item.rank === 2
                      ? 'bg-gray-100 text-gray-600'
                      : item.rank === 3
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{item.username}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-green-600 text-sm sm:text-base">
                      {item.completed_count}회 완료
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 안내 문구 */}
      <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6">
        빙고를 완료하고 리더보드에 이름을 올려보세요!
      </p>
    </div>
  );
}
