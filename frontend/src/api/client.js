import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRetry(apiClient, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const isIdempotent = !error.config || error.config.method !== 'post';
    return isIdempotent && axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

// Request interceptor - 인증 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 인증 에러 시 토큰 제거
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
