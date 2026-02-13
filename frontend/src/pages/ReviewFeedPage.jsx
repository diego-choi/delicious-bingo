import { useReviewFeed } from '../hooks/useReviewFeed';
import ReviewSocialSection from '../components/bingo/ReviewSocialSection';
import { SkeletonFeedItem } from '../components/common/Skeleton';

function StarRating({ rating }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function ReviewFeedPage() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewFeed();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          리뷰 피드
        </h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonFeedItem key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">리뷰를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-brand-orange hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const reviews = data?.pages.flatMap((page) => page.results) || [];

  if (reviews.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          리뷰 피드
        </h1>
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500">아직 공개된 리뷰가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
        리뷰 피드
      </h1>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl shadow p-4 sm:p-6"
          >
            {/* 작성자 + 맛집명 */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {review.display_name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {review.restaurant_name}
                </p>
              </div>
              <StarRating rating={review.rating} />
            </div>

            {/* 이미지 */}
            {review.image && (
              <img
                src={review.image}
                alt={`${review.restaurant_name} 리뷰`}
                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-3"
              />
            )}

            {/* 리뷰 내용 */}
            <p className="text-sm sm:text-base text-gray-700 mb-2">
              {review.content}
            </p>

            {/* 방문일 */}
            <p className="text-xs text-gray-400 mb-2">
              방문일: {review.visited_date}
            </p>

            {/* 소셜 인터랙션 */}
            <ReviewSocialSection review={review} boardId={null} />
          </div>
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasNextPage && (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
          </button>
        </div>
      )}
    </div>
  );
}
