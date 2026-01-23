import apiClient from '../../api/client';

// Admin 식당 API
export const adminRestaurantsApi = {
  getAll: (params = {}) => apiClient.get('/admin/restaurants/', { params }),
  getById: (id) => apiClient.get(`/admin/restaurants/${id}/`),
  create: (data) => apiClient.post('/admin/restaurants/', data),
  update: (id, data) => apiClient.patch(`/admin/restaurants/${id}/`, data),
  delete: (id) => apiClient.delete(`/admin/restaurants/${id}/`),
};

// Admin 템플릿 API
export const adminTemplatesApi = {
  getAll: (params = {}) => apiClient.get('/admin/templates/', { params }),
  getById: (id) => apiClient.get(`/admin/templates/${id}/`),
  create: (data) => apiClient.post('/admin/templates/', data),
  update: (id, data) => apiClient.patch(`/admin/templates/${id}/`, data),
  delete: (id) => apiClient.delete(`/admin/templates/${id}/`),
};

// Admin 카테고리 API
export const adminCategoriesApi = {
  getAll: () => apiClient.get('/admin/categories/'),
  getById: (id) => apiClient.get(`/admin/categories/${id}/`),
  create: (data) => apiClient.post('/admin/categories/', data),
  update: (id, data) => apiClient.patch(`/admin/categories/${id}/`, data),
  delete: (id) => apiClient.delete(`/admin/categories/${id}/`),
};

// 카카오 검색 API
export const kakaoSearchApi = {
  search: (query, x, y) => {
    const params = { query };
    if (x) params.x = x;
    if (y) params.y = y;
    return apiClient.get('/admin/kakao/search/', { params });
  },
};

// Admin 사용자 API
export const adminUsersApi = {
  getAll: (params = {}) => apiClient.get('/admin/users/', { params }),
  getById: (id) => apiClient.get(`/admin/users/${id}/`),
  update: (id, data) => apiClient.patch(`/admin/users/${id}/`, data),
};
