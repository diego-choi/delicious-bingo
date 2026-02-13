import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  useToggleLike,
  useReviewComments,
  useCreateComment,
  useDeleteComment,
} from '../../hooks/useReviewSocial';

export default function ReviewSocialSection({ review, boardId }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const toggleLike = useToggleLike(boardId);
  const createComment = useCreateComment(boardId);
  const deleteComment = useDeleteComment(boardId);
  const {
    data: comments,
    isLoading: commentsLoading,
  } = useReviewComments(showComments ? review.id : null);

  const handleLike = () => {
    if (!user) return;
    toggleLike.mutate(review.id);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    createComment.mutate(
      { reviewId: review.id, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    );
  };

  const handleDeleteComment = (commentId) => {
    deleteComment.mutate({ reviewId: review.id, commentId });
  };

  return (
    <div className="border-t pt-3 mt-3 space-y-3">
      {/* 좋아요 & 댓글 카운트 버튼 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={!user || toggleLike.isPending}
          className="flex items-center gap-1 text-sm disabled:opacity-50"
          aria-label={review.is_liked ? '좋아요 취소' : '좋아요'}
        >
          <span className={review.is_liked ? 'text-red-500' : 'text-gray-400'}>
            {review.is_liked ? '♥' : '♡'}
          </span>
          <span className="text-gray-600">{review.like_count || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          aria-label="댓글 보기"
        >
          <span>💬</span>
          <span>{review.comment_count || 0}</span>
        </button>
      </div>

      {/* 댓글 섹션 (펼쳤을 때) */}
      {showComments && (
        <div className="space-y-3">
          {/* 댓글 목록 */}
          {commentsLoading ? (
            <p className="text-sm text-gray-400">댓글 로딩 중...</p>
          ) : comments && comments.length > 0 ? (
            <ul className="space-y-2">
              {comments.map((comment) => (
                <li key={comment.id} className="text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-700">
                        {comment.display_name || comment.username}
                      </span>
                      <p className="text-gray-600 mt-0.5">{comment.content}</p>
                    </div>
                    {user && user.username === comment.username && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteComment.isPending}
                        className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                        aria-label="댓글 삭제"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">아직 댓글이 없습니다.</p>
          )}

          {/* 댓글 입력 폼 */}
          {user && (
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-orange"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || createComment.isPending}
                className="px-3 py-1.5 text-sm bg-brand-orange text-white rounded-lg disabled:opacity-50 hover:bg-brand-orange/90 transition-colors"
              >
                등록
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
