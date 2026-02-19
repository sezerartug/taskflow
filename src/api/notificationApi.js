import api from './axios';

export const notificationApi = {
  // Kullanıcının bildirimlerini getir
  getMyNotifications: () => api.get('/notifications'),

  // Okunmamış bildirim sayısını getir
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // Bildirimi okundu işaretle
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  // Tüm bildirimleri okundu işaretle
  markAllAsRead: () => api.post('/notifications/mark-all-read'),

  // Bildirim sil
  delete: (id) => api.delete(`/notifications/${id}`),
};