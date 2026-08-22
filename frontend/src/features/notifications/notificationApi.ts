import { api } from '@/api/client';
import type { AppNotification } from '@/features/notifications/notificationSlice';

export const notificationApi = {
  list: (unreadOnly = false) =>
    api
      .get<{ success: true; notifications: AppNotification[]; unreadCount: number }>('/notifications', {
        params: { unreadOnly },
      })
      .then((r) => r.data),

  markRead: (id: string) => api.put(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.put('/notifications/read-all').then((r) => r.data),
};
