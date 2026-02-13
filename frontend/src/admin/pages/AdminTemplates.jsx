import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminTemplatesApi, adminCategoriesApi } from '../api/adminEndpoints';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', is_active: '' });
  const { confirm, ...dialogProps } = useConfirmDialog();

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [currentPage, filters]);

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.is_active !== '') params.is_active = filters.is_active;

      const response = await adminTemplatesApi.getAll(params);
      setTemplates(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.error('템플릿 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: '템플릿 삭제',
      message: `"${title}" 템플릿을 삭제하시겠습니까?`,
      confirmText: '삭제',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await adminTemplatesApi.delete(id);
      fetchTemplates();
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (template) => {
    try {
      await adminTemplatesApi.update(template.id, { is_active: !template.is_active });
      fetchTemplates();
    } catch (error) {
      console.error('상태 변경 실패:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(pagination.count / 20);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">템플릿 관리</h1>
        <Link
          to="/admin/templates/new"
          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          템플릿 생성
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="템플릿 제목 검색"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">모든 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filters.is_active}
            onChange={(e) => handleFilterChange('is_active', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">활성화 상태</option>
            <option value="true">활성화</option>
            <option value="false">비활성화</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">등록된 템플릿이 없습니다.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      템플릿명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      식당 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      활성화
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{template.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-beige text-brand-orange">
                          {template.category_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {template.item_count || 0} / 25
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            template.is_active ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              template.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/templates/${template.id}`}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(template.id, template.title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    총 {pagination.count}개 중 {(currentPage - 1) * 20 + 1}-
                    {Math.min(currentPage * 20, pagination.count)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.previous}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={!pagination.next}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
