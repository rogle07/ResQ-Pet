import { api } from '@/api/client';
import type { User, UserRole } from '@/types';

interface AuthResponse {
  success: true;
  accessToken: string;
  user: User;
}

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    address?: { street?: string; city?: string; state?: string; zipCode?: string } | string;
  }) => api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  googleLogin: (
    payload: { idToken?: string; accessToken?: string; role?: string } | string,
    role?: string
  ) => {
    const body = typeof payload === 'string' ? { idToken: payload, role } : payload;
    return api.post<AuthResponse>('/auth/google', body).then((r) => r.data);
  },

  facebookLogin: (accessToken: string, role?: string) =>
    api.post<AuthResponse>('/auth/facebook', { accessToken, role }).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  me: () => api.get<{ success: true; user: User }>('/auth/me').then((r) => r.data),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }).then((r) => r.data),
};
