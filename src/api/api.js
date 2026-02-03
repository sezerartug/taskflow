import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  login: async ({ email, password }) => {
    // client-side validation
    if (!email || !email.trim()) {
      throw new Error("E-posta adresi gereklidir");
    }
    
    if (!password || !password.trim()) {
      throw new Error("Şifre gereklidir");
    }

    //  Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error("Geçerli bir e-posta adresi giriniz");
    }

    try {
      //  JSON Server'da doğru şekilde filtreleme
      const res = await client.get("/users", {
        params: { 
          email: email.trim(), 
          password: password.trim() 
        },
      });

      //  JSON Server bazen boş params ile tüm kullanıcıları döner
      // Bu yüzden ekstra kontrol yapıyoruz
      if (res.data.length === 0) {
        throw new Error("E-posta veya şifre hatalı");
      }
      
      const user = res.data[0];
      
      //  Ekstra güvenlik: gelen veriyi kontrol et
      if (!user || user.email !== email.trim() || user.password !== password.trim()) {
        throw new Error("Kimlik doğrulama başarısız");
      }

      return user;
    } catch (error) {
      // Axios hatası veya bizim hatamız
      if (error.response) {
        // Sunucudan gelen hata
        throw new Error(error.response.data?.message || "Sunucu hatası");
      } else if (error.request) {
        // İstek gitti ama yanıt gelmedi
        throw new Error("Sunucuya bağlanılamadı");
      } else {
        // Bizim fırlattığımız hata
        throw error;
      }
    }
  },

  //  TASKS
  getTasks: async () => {
    const res = await client.get("/tasks");
    return res.data;
  },

  addTask: async (task) => {
    const res = await client.post("/tasks", task);
    return res.data;
  },

  updateTask: async (task) => {
    const res = await client.put(`/tasks/${task.id}`, task);
    return res.data;
  },

  deleteTask: async (id) => {
    await client.delete(`/tasks/${id}`);
  },
};