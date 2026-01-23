import { useState } from 'react';

/**
 * 리뷰 작성 폼 컴포넌트
 * @param {Object} props
 * @param {function} props.onSubmit - 폼 제출 핸들러 (FormData)
 * @param {boolean} props.isSubmitting - 제출 중 여부
 */
export default function ReviewForm({ onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    visited_date: new Date().toISOString().split('T')[0],
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!image) {
      newErrors.image = '사진을 첨부해주세요.';
    }

    if (!formData.content || formData.content.length < 10) {
      newErrors.content = '리뷰는 최소 10자 이상 작성해주세요.';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = '평점을 선택해주세요.';
    }

    if (!formData.visited_date) {
      newErrors.visited_date = '방문일을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
    setErrors((prev) => ({ ...prev, rating: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append('content', formData.content);
    submitData.append('rating', formData.rating);
    submitData.append('visited_date', formData.visited_date);
    if (image) {
      submitData.append('image', image);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사진 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative w-24 h-24">
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
              <span className="text-2xl text-gray-400">+</span>
              <span className="text-xs text-gray-400">사진 추가</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
      </div>

      {/* 평점 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          평점 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className={`text-2xl transition-colors ${
                star <= formData.rating ? 'text-brand-gold' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">{formData.rating}점</span>
        </div>
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
        )}
      </div>

      {/* 방문일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          방문일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="visited_date"
          value={formData.visited_date}
          onChange={handleInputChange}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
        {errors.visited_date && (
          <p className="text-red-500 text-sm mt-1">{errors.visited_date}</p>
        )}
      </div>

      {/* 리뷰 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          리뷰 <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(최소 10자)</span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          rows={4}
          placeholder="맛집 방문 후기를 작성해주세요..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
        />
        <div className="flex justify-between text-sm mt-1">
          {errors.content ? (
            <p className="text-red-500">{errors.content}</p>
          ) : (
            <span></span>
          )}
          <span className={formData.content.length < 10 ? 'text-red-500' : 'text-gray-400'}>
            {formData.content.length}자
          </span>
        </div>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '리뷰 등록 중...' : '리뷰 등록하기'}
      </button>
    </form>
  );
}
