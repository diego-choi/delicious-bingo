import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';

export default function ProfilePage() {
  const { data, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [formErrors, setFormErrors] = useState({});

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 수정 모드 시작
  const handleEditClick = () => {
    setFormData({
      username: data.user.username,
      email: data.user.email,
    });
    setFormErrors({});
    setIsEditing(true);
  };

  // 수정 취소
  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({});
  };

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 프로필 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setFormErrors({ general: '프로필 수정에 실패했습니다.' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-500">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">프로필을 불러오는데 실패했습니다.</p>
        <Link to="/" className="text-brand-orange hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const { user, statistics, recent_activity } = data;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">내 프로필</h1>

      {/* 사용자 정보 섹션 */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">사용자 정보</h2>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="text-sm text-brand-orange hover:text-brand-orange/80"
            >
              수정
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {formErrors.general}
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent ${
                  formErrors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange/90 disabled:opacity-50"
              >
                {updateProfile.isPending ? '저장 중...' : '저장'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-gray-500 text-sm sm:w-24">사용자명</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-gray-500 text-sm sm:w-24">이메일</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-gray-500 text-sm sm:w-24">가입일</span>
              <span className="font-medium">{formatDate(user.date_joined)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 활동 통계 섹션 */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold mb-4">활동 통계</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-brand-beige rounded-lg">
            <p className="text-2xl font-bold text-brand-orange">{statistics.total_boards}</p>
            <p className="text-sm text-gray-600">시작한 빙고</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{statistics.completed_boards}</p>
            <p className="text-sm text-gray-600">완료한 빙고</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{statistics.total_reviews}</p>
            <p className="text-sm text-gray-600">작성한 리뷰</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {statistics.average_rating ? statistics.average_rating.toFixed(1) : '-'}
            </p>
            <p className="text-sm text-gray-600">평균 평점</p>
          </div>
        </div>
      </div>

      {/* 최근 완료한 빙고 */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold mb-4">최근 완료한 빙고</h2>
        {recent_activity.completed_boards.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 완료한 빙고가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {recent_activity.completed_boards.map((board) => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-brand-orange/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{board.template_title}</p>
                    <p className="text-sm text-gray-500">목표: {board.target_line_count}줄</p>
                  </div>
                  <p className="text-sm text-green-600">{formatDate(board.completed_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 최근 작성한 리뷰 */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">최근 작성한 리뷰</h2>
        {recent_activity.recent_reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 작성한 리뷰가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {recent_activity.recent_reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{review.restaurant_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-brand-gold">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.visited_date)} 방문
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
