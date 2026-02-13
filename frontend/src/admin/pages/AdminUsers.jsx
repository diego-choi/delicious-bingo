import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminUsersApi } from '../api/adminEndpoints';
import { useAuth } from '../../hooks/useAuth';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', is_staff: '', is_active: '' });
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage };
      if (filters.search) params.search = filters.search;
      if (filters.is_staff !== '') params.is_staff = filters.is_staff;
      if (filters.is_active !== '') params.is_active = filters.is_active;

      const response = await adminUsersApi.getAll(params);
      setUsers(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleToggle = async (userId, field, currentValue) => {
    // 자기 자신의 권한/활성 상태를 해제하는 것만 방지 (True -> False)
    if (userId === currentUser?.id && currentValue === true) {
      toast.error(field === 'is_staff'
        ? '자기 자신의 관리자 권한을 해제할 수 없습니다.'
        : '자기 자신을 비활성화할 수 없습니다.');
      return;
    }

    setUpdatingUserId(userId);
    try {
      await adminUsersApi.update(userId, { [field]: !currentValue });
      fetchUsers();
    } catch (error) {
      console.error('업데이트 실패:', error);
      toast.error(error.response?.data?.error || '업데이트에 실패했습니다.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const totalPages = Math.ceil(pagination.count / 20);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">사용자 관리</h1>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="사용자명 또는 이메일 검색"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <select
            value={filters.is_staff}
            onChange={(e) => handleFilterChange('is_staff', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">관리자 권한</option>
            <option value="true">관리자</option>
            <option value="false">일반 사용자</option>
          </select>
          <select
            value={filters.is_active}
            onChange={(e) => handleFilterChange('is_active', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">활성 상태</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">등록된 사용자가 없습니다.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      빙고판
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리자
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      활성
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 ${user.id === currentUser?.id ? 'bg-purple-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                나
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(user.date_joined)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.board_count}개</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggle(user.id, 'is_staff', user.is_staff)}
                          disabled={updatingUserId === user.id || (user.id === currentUser?.id && user.is_staff)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                            user.is_staff ? 'bg-purple-600' : 'bg-gray-200'
                          } ${(updatingUserId === user.id || (user.id === currentUser?.id && user.is_staff)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              user.is_staff ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggle(user.id, 'is_active', user.is_active)}
                          disabled={updatingUserId === user.id || (user.id === currentUser?.id && user.is_active)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            user.is_active ? 'bg-green-600' : 'bg-gray-200'
                          } ${(updatingUserId === user.id || (user.id === currentUser?.id && user.is_active)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              user.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
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
                    총 {pagination.count}명 중 {(currentPage - 1) * 20 + 1}-
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
    </div>
  );
}
