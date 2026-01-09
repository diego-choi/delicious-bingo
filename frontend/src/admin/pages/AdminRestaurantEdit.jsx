import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminRestaurantsApi, adminCategoriesApi } from '../api/adminEndpoints';
import KakaoPlaceSearch from '../components/KakaoPlaceSearch';

export default function AdminRestaurantEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: '',
    latitude: '',
    longitude: '',
    kakao_place_id: '',
    place_url: '',
    is_approved: true,
  });

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const fetchRestaurant = async () => {
    try {
      const response = await adminRestaurantsApi.getById(id);
      const data = response.data;
      setFormData({
        name: data.name || '',
        address: data.address || '',
        category: data.category || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        kakao_place_id: data.kakao_place_id || '',
        place_url: data.place_url || '',
        is_approved: data.is_approved ?? true,
      });
    } catch (error) {
      console.error('식당 정보 로드 실패:', error);
      alert('식당 정보를 불러오는데 실패했습니다.');
      navigate('/admin/restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleKakaoSelect = (place) => {
    setFormData((prev) => ({
      ...prev,
      name: place.name,
      address: place.road_address || place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      kakao_place_id: place.id,
      place_url: place.place_url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('식당명을 입력해주세요.');
      return;
    }

    if (!formData.category) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        category: formData.category || null,
        latitude: formData.latitude ? parseFloat(parseFloat(formData.latitude).toFixed(7)) : null,
        longitude: formData.longitude ? parseFloat(parseFloat(formData.longitude).toFixed(7)) : null,
        kakao_place_id: formData.kakao_place_id || null,
        place_url: formData.place_url || null,
      };

      if (isNew) {
        await adminRestaurantsApi.create(submitData);
      } else {
        await adminRestaurantsApi.update(id, submitData);
      }

      navigate('/admin/restaurants');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? '식당 등록' : '식당 수정'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카카오 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카카오에서 식당 검색
            </label>
            <KakaoPlaceSearch onSelect={handleKakaoSelect} />
            <p className="mt-1 text-xs text-gray-500">
              검색 후 선택하면 정보가 자동으로 입력됩니다.
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                식당명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="식당 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택 안함</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="주소를 입력하세요"
            />
          </div>

          {/* 좌표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위도
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="37.5665"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경도
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="126.9780"
              />
            </div>
          </div>

          {/* 카카오 정보 */}
          {formData.kakao_place_id && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">카카오 연동 정보</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>카카오 Place ID: {formData.kakao_place_id}</p>
                {formData.place_url && (
                  <p>
                    카카오맵:{' '}
                    <a
                      href={formData.place_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      바로가기
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 승인 상태 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_approved"
              id="is_approved"
              checked={formData.is_approved}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_approved" className="ml-2 block text-sm text-gray-700">
              승인됨
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/restaurants')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
