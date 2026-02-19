import api from './axios';

export const taskApi = {
  // Tüm görevleri getir
  getAll: () => api.get('/tasks'),

  // Tek görev getir
  getById: (id) => api.get(`/tasks/${id}`),

  // Yeni görev ekle
  create: (task) => api.post('/tasks', task),

  // Görev güncelle
  update: (id, task) => api.put(`/tasks/${id}`, task),

  // Görev durumunu güncelle (drag & drop için)
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

  // Görev sil
  delete: (id) => api.delete(`/tasks/${id}`),
};