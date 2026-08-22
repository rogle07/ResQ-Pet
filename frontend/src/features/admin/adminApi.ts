import { api } from '@/api/client';
import type { User, Pet } from '@/types';

export interface PlatformAnalytics {
  userCountsByRole: { _id: string; count: number }[];
  petCountsByStatus: { _id: string; count: number }[];
  rescueCountsByStatus: { _id: string; count: number }[];
  donationTotals: { totalAmount: number; count: number };
  monthlyDonations: { _id: { year: number; month: number }; totalAmount: number }[];
  monthlySignups: { _id: { year: number; month: number }; count: number }[];
}

export const adminApi = {
  getUsers: (params?: { role?: string; search?: string; page?: number }) =>
    api
      .get<{ success: true; users: User[]; total: number; pages: number }>('/admin/users', { params })
      .then((r) => r.data),

  setUserActive: (id: string, isActive: boolean) =>
    api.put(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),

  verifyOrganization: (id: string) => api.put(`/admin/users/${id}/verify`).then((r) => r.data),

  getPets: (params?: { status?: string; page?: number }) =>
    api.get<{ success: true; pets: Pet[]; total: number; pages: number }>('/admin/pets', { params }).then((r) => r.data),

  deletePet: (id: string) => api.delete(`/admin/pets/${id}`).then((r) => r.data),

  getAnalytics: () =>
    api.get<{ success: true; analytics: PlatformAnalytics }>('/admin/analytics').then((r) => r.data.analytics),

  getSettings: () => api.get<{ success: true; settings: Record<string, unknown> }>('/admin/settings').then((r) => r.data.settings),

  updateSetting: (key: string, value: unknown) => api.put(`/admin/settings/${key}`, { value }).then((r) => r.data),
};
