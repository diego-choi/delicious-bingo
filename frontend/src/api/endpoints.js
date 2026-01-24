import apiClient from './client';

// 카테고리 API
export const categoriesApi = {
  getAll: () => apiClient.get('/categories/'),
  getById: (id) => apiClient.get(`/categories/${id}/`),
};

// 템플릿 API
export const templatesApi = {
  getAll: () => apiClient.get('/templates/'),
  getById: (id) => apiClient.get(`/templates/${id}/`),
};

// 빙고 보드 API
export const boardsApi = {
  getAll: () => apiClient.get('/boards/'),
  getById: (id) => apiClient.get(`/boards/${id}/`),
  create: (data) => apiClient.post('/boards/', data),
  delete: (id) => apiClient.delete(`/boards/${id}/`),
};

// 리뷰 API
export const reviewsApi = {
  create: (formData) =>
    apiClient.post('/reviews/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getById: (id) => apiClient.get(`/reviews/${id}/`),
};

// 리더보드 API
export const leaderboardApi = {
  get: () => apiClient.get('/leaderboard/'),
};

// 인증 API
export const authApi = {
  register: (data) => apiClient.post('/auth/register/', data),
  login: (username, password) =>
    apiClient.post('/auth/login/', { username, password }),
  logout: () => apiClient.post('/auth/logout/'),
  me: () => apiClient.get('/auth/me/'),
  getProfile: () => apiClient.get('/auth/profile/'),
  updateProfile: (data) => apiClient.patch('/auth/profile/', data),
  kakaoAuthorize: (redirectUri) =>
    apiClient.get('/auth/kakao/authorize/', { params: { redirect_uri: redirectUri } }),
  kakaoLogin: (code, state) =>
    apiClient.post('/auth/kakao/login/', { code, state }),
};
