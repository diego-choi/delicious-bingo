import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminRestaurantsApi, adminTemplatesApi, adminCategoriesApi } from '../api/adminEndpoints';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    restaurants: 0,
    templates: 0,
    categories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [restaurantsRes, templatesRes, categoriesRes] = await Promise.all([
          adminRestaurantsApi.getAll({ page_size: 1 }),
          adminTemplatesApi.getAll({ page_size: 1 }),
          adminCategoriesApi.getAll(),
        ]);

        setStats({
          restaurants: restaurantsRes.data.count || 0,
          templates: templatesRes.data.count || 0,
          categories: categoriesRes.data.length || 0,
        });
      } catch (error) {
        console.error('통계 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: '등록된 식당',
      value: stats.restaurants,
      link: '/admin/restaurants',
      color: 'bg-blue-500',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: '빙고 템플릿',
      value: stats.templates,
      link: '/admin/templates',
      color: 'bg-green-500',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      title: '카테고리',
      value: stats.categories,
      link: '/admin/categories',
      color: 'bg-brand-orange',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">대시보드</h1>

      {isLoading ? (
        <div className="text-gray-500">로딩 중...</div>
      ) : (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${card.color} text-white p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 빠른 액션 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">빠른 액션</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/restaurants/new"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                식당 등록
              </Link>
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
          </div>
        </>
      )}
    </div>
  );
}
