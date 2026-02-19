import axios from 'axios';
import { message } from 'antd';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Her isteğe token ekle
instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hata yönetimi
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";
    
    if (error.response) {
      // Sunucu hatası (4xx, 5xx)
      const status = error.response.status;
      const data = error.response.data;
      
      // Backend'den gelen özel hata mesajı
      if (data && data.message) {
        errorMessage = data.message;
      } else if (status === 400) {
        errorMessage = "Geçersiz istek. Lütfen bilgileri kontrol edin.";
      } else if (status === 401) {
        errorMessage = "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";
        // Token geçersiz, logout yap
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        errorMessage = "Bu işlem için yetkiniz yok.";
      } else if (status === 404) {
        errorMessage = "İstenen kaynak bulunamadı.";
      } else if (status === 500) {
        errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
      }
    } else if (error.request) {
      // İstek gönderildi ama cevap alınamadı
      errorMessage = "Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.";
    } else {
      // İstek oluşturulurken hata
      errorMessage = error.message || "Bilinmeyen bir hata oluştu.";
    }
    
    // ✅ VITE UYUMLU: import.meta.env kullan
    if (import.meta.env.MODE === 'development') {
      console.error("❌ API hatası:", error);
    }
    
    // Kullanıcıya göster (eğer login sayfasında değilse)
    if (!window.location.pathname.includes('/login')) {
      message.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default instance;