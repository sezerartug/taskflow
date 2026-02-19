import api from './axios';

export const userApi = {
  // Tüm kullanıcıları getir
  getAll: () => api.get('/users'),

  // Tek kullanıcı getir
  getById: (id) => api.get(`/users/${id}`),

  // Kullanıcı güncelle
  update: (id, userData) => api.put(`/users/${id}`, userData),

  // ✅ MULTER İLE AVATAR YÜKLEME
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file); // 'avatar' backend'deki field adıyla aynı olmalı
    
    return api.patch(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
};