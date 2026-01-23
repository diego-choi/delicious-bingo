import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { generateConfettiItems } from '../../constants/confetti';

/**
 * 빙고 완료 축하 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {number} props.completedLines - 완료된 라인 수
 * @param {boolean} props.isGoalAchieved - 목표 달성 여부
 */
export default function CompletionCelebration({
  isOpen,
  onClose,
  completedLines,
  isGoalAchieved = false,
}) {
  const confettiRef = useRef(null);

  // 컨페티 요소들의 값을 미리 계산
  const confettiItems = useMemo(() => generateConfettiItems(), []);

  // 컨페티 타이머 (DOM 조작)
  useEffect(() => {
    if (isOpen && confettiRef.current) {
      confettiRef.current.style.display = 'block';
      const timer = setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.style.display = 'none';
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {/* 컨페티 효과 - 오렌지/골드 원형 */}
      <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiItems.map((item) => (
          <div
            key={item.id}
            className="absolute rounded-full animate-confetti-fall"
            style={{
              left: `${item.left}%`,
              top: `-20px`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              backgroundColor: item.color,
              '--confetti-duration': `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center relative z-10 mx-4">
        {/* 아이콘 */}
        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">
          {isGoalAchieved ? '🏆' : '🎉'}
        </div>

        {/* 제목 */}
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          {isGoalAchieved ? (
            <span className="text-brand-orange">목표 달성!</span>
          ) : (
            <span className="text-green-600">빙고!</span>
          )}
        </h2>

        {/* 메시지 */}
        <p className="text-gray-600 mb-2 text-sm sm:text-base">
          {isGoalAchieved
            ? '축하합니다! 빙고 목표를 달성했습니다!'
            : `${completedLines}줄 빙고를 완성했습니다!`}
        </p>

        {isGoalAchieved && (
          <p className="text-xs sm:text-sm text-brand-orange mb-4">
            리더보드에 기록되었습니다! 🏅
          </p>
        )}

        {/* 버튼들 */}
        <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
          {isGoalAchieved && (
            <Link
              to="/leaderboard"
              className="block w-full py-2.5 sm:py-3 bg-brand-orange text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-brand-orange/90 transition-colors"
            >
              리더보드 보기
            </Link>
          )}
          <button
            onClick={onClose}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
              isGoalAchieved
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-brand-orange text-white hover:bg-brand-orange/90'
            }`}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
