import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { store } from '@/app/store';
import { setAccessToken, logout } from '@/features/auth/authSlice';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the httpOnly refresh-token cookie
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Do NOT attempt token refresh or page reload on authentication endpoints.
    // Legitimate auth failures (e.g. invalid credentials on login, duplicate email on register,
    // invalid social tokens) should be returned straight to the UI component.
    const url = originalRequest?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/google') ||
      url.includes('/auth/facebook') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh completes
        return new Promise((resolve) => {
          pendingQueue.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        store.dispatch(setAccessToken(data.accessToken));
        pendingQueue.forEach((run) => run());
        pendingQueue = [];
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        // Only redirect to login if we are not already on an auth page
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
