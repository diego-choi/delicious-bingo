import { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    emoji: '🎯',
    title: '빙고 템플릿을 선택하세요',
    description: '다양한 맛집 빙고 템플릿 중 도전하고 싶은 것을 골라보세요. 난이도(1~12줄)도 직접 선택할 수 있어요!',
  },
  {
    emoji: '🍽️',
    title: '맛집 방문 후 리뷰를 남기세요',
    description: '빙고판의 맛집을 방문하고 사진과 함께 리뷰를 작성하면 해당 칸이 활성화됩니다.',
  },
  {
    emoji: '🎉',
    title: '빙고 라인을 완성하세요!',
    description: '가로, 세로, 대각선 라인을 완성하면 빙고! 목표 라인 수를 달성하면 축하 효과와 함께 리더보드에 등록돼요.',
  },
];

export default function OnboardingModal({ isOpen, onClose, onStart }) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onStartRef = useRef(onStart);

  onCloseRef.current = onClose;
  onStartRef.current = onStart;

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    previousFocusRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll('button');
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const firstButton = dialogRef.current?.querySelector('button');
    firstButton?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleStart = () => {
    onCloseRef.current();
    onStartRef.current?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        data-testid="onboarding-backdrop"
        className="absolute inset-0 bg-black/50"
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        className="relative bg-brand-cream rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8"
      >
        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              data-testid="step-indicator"
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === step ? 'bg-brand-orange' : 'bg-brand-beige'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h3
            id="onboarding-title"
            className="text-lg sm:text-xl font-bold text-brand-charcoal mb-3 font-display"
          >
            {current.title}
          </h3>
          <p
            id="onboarding-description"
            className="text-sm sm:text-base text-brand-charcoal/70 leading-relaxed"
          >
            {current.description}
          </p>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-brand-charcoal/40 mb-4">
          {step + 1} / {STEPS.length}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onCloseRef.current()}
            className="text-sm text-brand-charcoal/50 hover:text-brand-charcoal/70 transition-colors"
          >
            건너뛰기
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-brand-charcoal/70 bg-brand-beige rounded-lg hover:bg-brand-beige/80 transition-colors"
              >
                이전
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleStart}
                className="px-5 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 transition-colors"
              >
                시작하기
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 text-sm font-medium text-white bg-brand-orange rounded-lg hover:bg-brand-orange/90 transition-colors"
              >
                다음
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
