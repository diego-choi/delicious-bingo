/**
 * 로딩 스피너 컴포넌트
 * @param {Object} props
 * @param {string} props.size - 크기 ('sm' | 'md' | 'lg')
 * @param {string} props.message - 로딩 메시지
 * @param {boolean} props.fullScreen - 전체 화면 여부
 */
export default function LoadingSpinner({
  size = 'md',
  message = '',
  fullScreen = false,
}) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="text-center">
      <div
        className={`animate-spin rounded-full border-amber-500 border-t-transparent mx-auto ${sizeClasses[size]}`}
      />
      {message && (
        <p className="text-gray-500 mt-3 text-sm">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
