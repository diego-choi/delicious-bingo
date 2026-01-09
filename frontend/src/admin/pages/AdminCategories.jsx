import { useState, useEffect } from 'react';
import { adminCategoriesApi } from '../api/adminEndpoints';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await adminCategoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;

    try {
      await adminCategoriesApi.create({ name: newName.trim() });
      setNewName('');
      setIsAdding(false);
      fetchCategories();
    } catch (error) {
      console.error('추가 실패:', error);
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;

    try {
      await adminCategoriesApi.update(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
      fetchCategories();
    } catch (error) {
      console.error('수정 실패:', error);
      alert('카테고리 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 카테고리를 삭제하시겠습니까?\n연결된 식당과 템플릿의 카테고리가 제거됩니다.`)) return;

    try {
      await adminCategoriesApi.delete(id);
      fetchCategories();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setIsAdding(false);
    setNewName('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">카테고리 관리</h1>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            카테고리 추가
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* 새 카테고리 입력 */}
            {isAdding && (
              <div className="p-4 bg-amber-50">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="새 카테고리 이름"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdd();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">등록된 카테고리가 없습니다.</div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  {editingId === category.id ? (
                    <div className="flex-1 flex items-center space-x-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(category.id);
                          if (e.key === 'Escape') handleCancel();
                        }}
                      />
                      <button
                        onClick={() => handleUpdate(category.id)}
                        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                          {category.name}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          식당 {category.restaurant_count || 0}개
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="px-3 py-1.5 text-sm text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
