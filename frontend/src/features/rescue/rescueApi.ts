import { api } from '@/api/client';

export interface RescueRequest {
  _id: string;
  pet?: { _id: string; name: string; species: string; images: { url: string }[] };
  requestedBy: { _id: string; name: string; phone?: string };
  assignedTeam?: { _id: string; name: string };
  type: 'emergency' | 'lost_pet' | 'injured_animal' | 'stray';
  description?: string;
  photos: { url: string }[];
  location: { lat: number; lng: number; address?: string };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeline: { status: string; note?: string; at: string }[];
  createdAt: string;
}

export const rescueApi = {
  list: (status?: string) =>
    api
      .get<{ success: true; requests: RescueRequest[] }>('/rescue', { params: status ? { status } : {} })
      .then((r) => r.data.requests),

  getById: (id: string) =>
    api.get<{ success: true; rescueRequest: RescueRequest }>(`/rescue/${id}`).then((r) => r.data.rescueRequest),

  accept: (id: string) =>
    api.post<{ success: true; rescueRequest: RescueRequest }>(`/rescue/${id}/accept`).then((r) => r.data.rescueRequest),

  updateStatus: (id: string, status: string, note?: string) => {
    const formData = new FormData();
    formData.append('status', status);
    if (note) formData.append('note', note);
    return api
      .put<{ success: true; rescueRequest: RescueRequest }>(`/rescue/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.rescueRequest);
  },
};
