import api from './axios';

export const commentApi = {
  // Bir göreve ait yorumları getir
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),

  // Yorum ekle
  create: (comment) => api.post('/comments', comment),

  // Yorum güncelle
  update: (id, comment) => api.put(`/comments/${id}`, comment),

  // Yorum sil
  delete: (id) => api.delete(`/comments/${id}`),

  // Bir yoruma verilen cevapları getir (thread)
  getReplies: (commentId) => api.get(`/comments/${commentId}/replies`),
};