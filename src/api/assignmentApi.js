import api from './axios';

export const assignmentApi = {
  // Bir göreve ait atama geçmişini getir
  getByTask: (taskId) => api.get(`/assignments/task/${taskId}`),

  // Tüm atama kayıtlarını getir
  getAll: () => api.get('/assignments'),
};