import { useState } from 'react';
import ReviewForm from '../forms/ReviewForm';
import KakaoMap from '../map/KakaoMap';
import ReviewSocialSection from '../bingo/ReviewSocialSection';

/**
 * 셀 상세 모달 컴포넌트
 * @param {Object} props
 * @param {Object} props.cell - 셀 데이터
 * @param {number} props.boardId - 빙고 보드 ID
 * @param {function} props.onClose - 모달 닫기 핸들러
 * @param {function} props.onReviewSubmit - 리뷰 제출 핸들러
 * @param {boolean} props.isSubmitting - 제출 중 여부
 */
export default function CellDetailModal({
  cell,
  boardId,
  onClose,
  onReviewSubmit,
  isSubmitting = false,
}) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReviewSubmit = (formData) => {
    // 셀 정보 추가
    formData.append('bingo_board', boardId);
    formData.append('restaurant', cell.restaurant.id);
    onReviewSubmit(formData);
  };

  const { restaurant } = cell;
  const hasLocation = restaurant.latitude && restaurant.longitude;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* 모바일 드래그 핸들 */}
        <div className="sm:hidden pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
          <h2 className="text-base sm:text-lg font-bold pr-2 truncate text-brand-charcoal">{restaurant.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 카카오맵 */}
          {hasLocation && (
            <KakaoMap
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
              name={restaurant.name}
              placeUrl={restaurant.place_url}
              className="h-48"
            />
          )}

          {/* 맛집 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">
                #{cell.position + 1}번 칸
              </span>
              {restaurant.category_name && (
                <span className="bg-brand-beige text-brand-orange px-2 py-1 rounded">
                  {restaurant.category_name}
                </span>
              )}
            </div>

            {restaurant.address && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">주소:</span> {restaurant.address}
              </p>
            )}

            {/* 카카오 플레이스 링크 */}
            {restaurant.place_url && (
              <a
                href={restaurant.place_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-brand-orange hover:underline"
              >
                카카오맵에서 상세보기 →
              </a>
            )}
          </div>

          {/* 리뷰 상태에 따른 분기 */}
          {cell.is_activated ? (
            // 이미 리뷰를 작성한 경우
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600 text-lg">✓</span>
                <span className="font-medium text-green-700">방문 완료!</span>
              </div>

              {cell.review && (
                <div className="space-y-3">
                  {/* 리뷰 이미지 */}
                  {cell.review.image && (
                    <img
                      src={cell.review.image}
                      alt="리뷰 사진"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}

                  {/* 평점 */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= cell.review.rating
                            ? 'text-brand-gold'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {cell.review.rating}점
                    </span>
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-gray-700">{cell.review.content}</p>

                  {/* 방문일 */}
                  <p className="text-sm text-gray-500">
                    방문일: {cell.review.visited_date}
                  </p>

                  {/* 좋아요/댓글 */}
                  {cell.review.is_public && (
                    <ReviewSocialSection review={cell.review} boardId={boardId} />
                  )}
                </div>
              )}
            </div>
          ) : showReviewForm ? (
            // 리뷰 작성 폼 표시
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">리뷰 작성</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  취소
                </button>
              </div>
              <ReviewForm onSubmit={handleReviewSubmit} isSubmitting={isSubmitting} />
            </div>
          ) : (
            // 아직 방문하지 않은 경우
            <div className="bg-brand-beige p-4 rounded-lg">
              <p className="text-brand-orange mb-3">아직 방문하지 않은 맛집입니다.</p>
              <p className="text-sm text-gray-600 mb-4">
                맛집을 방문하고 리뷰를 작성하면 빙고 칸이 활성화됩니다!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange/90 transition-colors"
              >
                리뷰 작성하기
              </button>
            </div>
          )}
        </div>

        {/* 푸터 */}
        {cell.is_activated && (
          <div className="border-t px-6 py-4">
            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
