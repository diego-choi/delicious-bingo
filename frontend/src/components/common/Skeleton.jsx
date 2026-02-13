export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="mt-3 bg-gray-200 rounded-full h-2" />
    </div>
  );
}

export function SkeletonBingoGrid() {
  return (
    <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
      <div className="animate-pulse bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            data-testid="skeleton-cell"
            className="animate-pulse aspect-square bg-gray-200 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonFeedItem() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-28" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-48 sm:h-64 bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}
