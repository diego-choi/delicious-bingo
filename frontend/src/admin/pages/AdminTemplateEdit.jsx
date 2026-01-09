import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminTemplatesApi, adminCategoriesApi, adminRestaurantsApi } from '../api/adminEndpoints';

export default function AdminTemplateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    is_active: true,
    items: Array(25).fill(null),
  });

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
    if (!isNew) {
      fetchTemplate();
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

  const fetchRestaurants = async () => {
    try {
      const response = await adminRestaurantsApi.getAll({ page_size: 100, is_approved: true });
      setRestaurants(response.data.results || []);
    } catch (error) {
      console.error('식당 목록 로드 실패:', error);
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await adminTemplatesApi.getById(id);
      const data = response.data;

      // items 배열을 position 기반으로 재구성
      const itemsArray = Array(25).fill(null);
      if (data.items) {
        data.items.forEach((item) => {
          if (item.position >= 0 && item.position < 25) {
            itemsArray[item.position] = item.restaurant;
          }
        });
      }

      setFormData({
        title: data.title || '',
        category: data.category || '',
        is_active: data.is_active ?? true,
        items: itemsArray,
      });
    } catch (error) {
      console.error('템플릿 정보 로드 실패:', error);
      alert('템플릿 정보를 불러오는데 실패했습니다.');
      navigate('/admin/templates');
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

  const handleItemChange = (position, restaurantId) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[position] = restaurantId ? parseInt(restaurantId) : null;
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('템플릿 제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const items = formData.items
        .map((restaurantId, position) =>
          restaurantId ? { position, restaurant: restaurantId } : null
        )
        .filter(Boolean);

      const submitData = {
        title: formData.title,
        category: formData.category || null,
        is_active: formData.is_active,
        items,
      };

      if (isNew) {
        await adminTemplatesApi.create(submitData);
      } else {
        await adminTemplatesApi.update(id, submitData);
      }

      navigate('/admin/templates');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    return restaurant ? restaurant.name : '';
  };

  const filledCount = formData.items.filter(Boolean).length;

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
          {isNew ? '템플릿 생성' : '템플릿 수정'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          5x5 빙고 그리드에 식당을 배치하세요. 식당 선택 모달은 다음 업데이트에서 개선됩니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                템플릿 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="예: 평양냉면 빙고"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

          {/* 활성화 상태 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              활성화 (사용자에게 표시)
            </label>
          </div>

          {/* 5x5 그리드 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                빙고 그리드
              </label>
              <span className="text-sm text-gray-500">
                배치됨: {filledCount} / 25
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 max-w-2xl">
              {formData.items.map((restaurantId, index) => (
                <div
                  key={index}
                  className="aspect-square border-2 border-gray-200 rounded-lg overflow-hidden"
                >
                  <select
                    value={restaurantId || ''}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className={`w-full h-full text-xs text-center cursor-pointer border-0 focus:ring-2 focus:ring-green-500 ${
                      restaurantId ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <option value="">--</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/templates')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
