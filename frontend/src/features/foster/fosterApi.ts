import { api } from '@/api/client';

export interface FosterRequest {
  _id: string;
  pet: { _id: string; name: string; species: string; images: { url: string }[] };
  requestedBy: { _id: string; name: string; phone?: string };
  fosterProvider?: { _id: string; name: string };
  reason?: string;
  durationDays?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
  messages: { sender: { _id: string; name: string }; text: string; sentAt: string }[];
  createdAt: string;
}

export const fosterApi = {
  list: (status?: string) =>
    api
      .get<{ success: true; requests: FosterRequest[] }>('/foster', { params: status ? { status } : {} })
      .then((r) => r.data.requests),

  getById: (id: string) =>
    api.get<{ success: true; fosterRequest: FosterRequest }>(`/foster/${id}`).then((r) => r.data.fosterRequest),

  create: (payload: { petId: string; reason?: string; durationDays?: number }) =>
    api
      .post<{ success: true; fosterRequest: FosterRequest }>('/foster', payload)
      .then((r) => r.data.fosterRequest),

  accept: (id: string) =>
    api.post<{ success: true; fosterRequest: FosterRequest }>(`/foster/${id}/accept`).then((r) => r.data.fosterRequest),

  reject: (id: string) =>
    api.post<{ success: true; fosterRequest: FosterRequest }>(`/foster/${id}/reject`).then((r) => r.data.fosterRequest),

  sendMessage: (id: string, text: string) => api.post(`/foster/${id}/messages`, { text }).then((r) => r.data),

  complete: (id: string) => api.post(`/foster/${id}/complete`).then((r) => r.data),
};
