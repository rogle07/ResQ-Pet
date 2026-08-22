import { api } from '@/api/client';

export interface Donation {
  _id: string;
  donor: { _id: string; name: string };
  type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
}

export interface DonationAnalytics {
  totals: { totalAmount: number; count: number };
  byType: { _id: string; totalAmount: number; count: number }[];
  monthly: { _id: { year: number; month: number }; totalAmount: number }[];
}

export const donationApi = {
  history: () => api.get<{ success: true; donations: Donation[] }>('/donations/history').then((r) => r.data.donations),

  analytics: () => api.get<{ success: true } & DonationAnalytics>('/donations/analytics').then((r) => r.data),

  create: (payload: { amount: number; type: string; currency?: string; ngoId?: string; message?: string }) =>
    api.post<{ success: true; clientSecret: string }>('/donations', payload).then((r) => r.data),
};
