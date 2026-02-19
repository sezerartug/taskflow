import api from './axios';

export const activityApi = {
  // Bir göreve ait aktiviteleri getir
  getByTask: (taskId) => api.get(`/activities/task/${taskId}`),

  // Tüm aktiviteleri getir (dashboard için)
  getAll: () => api.get('/activities'),
};