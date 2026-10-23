import { api } from '@/api/client';

export interface Donation {
  _id: string;
  donor: { _id: string; name: string };
  ngo?: { _id: string; name: string };
  type: 'one_time' | 'monthly' | 'food' | 'medicine' | 'rescue';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  isRecurring: boolean;
  message?: string;
  paymentIntentId?: string;
  createdAt: string;
}

export interface DonationAnalytics {
  totals: { totalAmount: number; count: number };
  byType: { _id: string; totalAmount: number; count: number }[];
  monthly: { _id: { year: number; month: number }; totalAmount: number; count: number }[];
}

export interface CreateDonationPayload {
  amount: number;
  type: 'one_time' | 'monthly' | 'food' | 'medicine' | 'rescue';
  currency?: string;
  ngoId?: string;
  message?: string;
  isRecurring?: boolean;
}

export interface PosterCarePaymentPayload {
  amount: number;
  serviceType: 'foster_care' | 'ngo_shelter' | 'rescue' | 'vet_consultation' | 'adoption' | string;
  currency?: string;
  relatedRequestId?: string;
  message?: string;
}

export interface CreateDonationResponse {
  success: true;
  donation: Donation;
  clientSecret: string;
}

export interface PosterCarePaymentResponse extends CreateDonationResponse {
  serviceType: string;
}

export const donationApi = {
  history: () =>
    api.get<{ success: true; donations: Donation[] }>('/donations/history').then((r) => r.data.donations),

  analytics: () =>
    api.get<{ success: true } & DonationAnalytics>('/donations/analytics').then((r) => r.data),

  create: (payload: CreateDonationPayload) =>
    api.post<CreateDonationResponse>('/donations', payload).then((r) => r.data),

  /**
   * Create a Stripe PaymentIntent for pet owner poster/care service fees.
   * Used in the "Poster Care Request" panel to pay for foster, NGO shelter,
   * rescue, vet, or adoption service fees.
   */
  posterCarePayment: (payload: PosterCarePaymentPayload) =>
    api.post<PosterCarePaymentResponse>('/donations/poster-care-payment', payload).then((r) => r.data),

  getById: (id: string) =>
    api.get<{ success: true; donation: Donation }>(`/donations/${id}`).then((r) => r.data.donation),

  confirmPayment: (id: string) =>
    api.post<{ success: true; donation: Donation }>(`/donations/${id}/confirm`).then((r) => r.data.donation),

  createRazorpayOrder: (payload: { amount: number; currency?: string; purpose?: string; notes?: Record<string, string> }) =>
    api
      .post<{ success: true; order: any; keyId: string }>('/donations/razorpay/order', payload)
      .then((r) => r.data),

  verifyRazorpayPayment: (payload: {
    razorpay_order_id?: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    amount?: number;
    currency?: string;
    purpose?: string;
    message?: string;
  }) =>
    api
      .post<{ success: true; donation: Donation; paymentId: string }>('/donations/razorpay/verify', payload)
      .then((r) => r.data),
};
