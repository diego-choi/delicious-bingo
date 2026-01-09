import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api/endpoints';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = localStorage.getItem('authToken');
    if (token) {
      authApi.me()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      Promise.resolve().then(() => setIsLoading(false));
    }
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);
    const { token, user: userData } = response.data;
    localStorage.setItem('authToken', token);
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await authApi.login(username, password);
    const { token, user: userData } = response.data;
    localStorage.setItem('authToken', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 에러 무시
    }
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
