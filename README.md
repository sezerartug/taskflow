# 🚀 TaskFlow - Modern Görev Yönetim Sistemi

TaskFlow, ekiplerin görevlerini kolayca yönetebileceği, atama yapabileceği, yorum ekleyebileceği ve gerçek zamanlı bildirimler alabileceği modern bir görev yönetim uygulamasıdır.

## ✨ Özellikler

### ✅ Görev Yönetimi

- 📝 Görev ekleme, düzenleme, silme
- 📊 Kanban board ile görsel takip
- 🔍 Gelişmiş filtreleme ve sıralama (durum, öncelik, atanan kişi, tarih aralığı, etiket)
- 📥 CSV export

### 👥 Kullanıcı & Rol Yönetimi

- 👤 3 farklı rol: Admin, Project Manager, Developer
- 🖼️ Profil fotoğrafı yükleme (Multer ile dosya upload)
- 📋 Kullanıcı listesi ve filtreleme (sadece Admin)
- 🔐 Rol tabanlı yetkilendirme

### 📌 Görev Atama

- 👥 Birden fazla kişiye atama
- 📋 "Bana Atanan Görevler" sayfası
- 📝 Atama geçmişi
- 🔔 Gerçek zamanlı bildirim sistemi

### 💬 Yorum Sistemi

- 💭 Görevlere yorum ekleme
- ✏️ Yorum düzenleme/silme
- @mention ile kullanıcı etiketleme
- 🔔 Mention bildirimleri
- 📎 Dosya/Görsel ekleme

### 📊 Dashboard & Raporlama

- 📈 Görev dağılımı grafikleri (PieChart)
- 🎯 Tamamlanma oranı (Progress Circle)
- 📊 Öncelik dağılımı (BarChart)
- 📱 Responsive tasarım

### 🎨 Tasarım

- 🌗 Dark/Light tema desteği
- 🎭 Modern kart tasarımı
- 🖱️ Hover efektleri ve animasyonlar
- 📱 Mobil uyumlu

## 🛠️ Kullanılan Teknolojiler

### Frontend

- ⚛️ **React 19** + Vite
- 🎨 **Ant Design 6** - UI kütüphanesi
- 💨 **TailwindCSS 4** - Stil ve responsive tasarım
- 📊 **Recharts** - Dashboard grafikleri
- 🔄 **Redux Toolkit** - State yönetimi
- 🔌 **Socket.io-client** - Gerçek zamanlı bildirimler
- 🖱️ **dnd-kit** - Drag & drop işlemleri
- 📥 **PapaParse** - CSV export
- 🌐 **Axios** - HTTP istemcisi
- 📅 **Day.js** - Tarih işlemleri

### Backend

- 🚀 **Node.js** + Express
- 🗄️ **MongoDB** + Mongoose
- 🔐 **JWT** - Kimlik doğrulama
- 🔒 **bcryptjs** - Şifre hash'leme
- 🔌 **Socket.io** - Gerçek zamanlı iletişim
- 📁 **Multer** - Dosya yükleme
- 📧 **Nodemailer** - Email bildirimleri (opsiyonel)

## 🚀 Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)   
- MongoDB (yerel veya Atlas)   

### Adım Adım Kurulum

1. **Depoyu klonlayın**

   ```  
   bash
      git clone https://github.com/sezerartug/taskflow.git 
         cd taskflow
   ```

2. **Backend kurulumu**
   ```bash
      cd backend
      npm install
   ```

3. **Backend environment değişkenlerini ayarlayın**      
.env dosyası oluşturun:

PORT=5000    
MONGO_URI=mongodb://localhost:27017/taskflow     
JWT_SECRET=supersecretkey

4. **Frontend kurulumu**
   ```cd .. (ana dizine dönün)
      npm install
   ```
5. **Uygulamayı Başlatın**     
      
      Backend:
```
cd backend    
npm run dev    
```

   Frontend (yeni terminal):

npm run dev

6. **Tarayıcıda açın**
http://localhost:5173

---

### 🔑 Demo Kullanıcı Giriş Bilgileri

| Rol | E-posta | Şifre |
| :--- | :--- | :--- |
| **Admin** | `admin@taskflow.com` | `123456` |

> [!TIP]
> **Not:** Daha fazla kullanıcı oluşturmak için Postman veya benzeri bir araçla `/api/auth/register` uç noktasına (endpoint) istek atabilirsiniz.

---



📁 Proje Yapısı
```
taskflow/
├── backend/                    # Backend klasörü
│   ├── src/
│   │   ├── controllers/        # İş mantığı
│   │   ├── models/             # MongoDB modelleri
│   │   ├── routes/             # API route'ları
│   │   ├── middleware/         # Middleware'ler
│   │   ├── utils/              # Yardımcı fonksiyonlar
│   │   └── app.js              # Express uygulaması
│   ├── uploads/                # Yüklenen dosyalar
│   └── server.js               # Sunucu giriş noktası
│
├── src/                         # Frontend klasörü
│   ├── api/                     # API servisleri
│   ├── components/              # React componentleri
│   ├── context/                 # Context API (Auth, Theme)
│   ├── features/                # Redux slice'lar
│   ├── pages/                   # Sayfalar
│   ├── utils/                   # Yardımcı fonksiyonlar
│   ├── App.jsx                  # Ana uygulama
│   └── main.jsx                 # Giriş noktası
│
├── public/                       # Statik dosyalar
├── index.html                    # HTML şablonu
└── package.json                  # Bağımlılıklar
```

📚 API Dokümantasyonu

Auth

POST /api/auth/register - Yeni kullanıcı kaydı    
POST /api/auth/login - Kullanıcı girişi    

Users

GET /api/users - Tüm kullanıcıları listele   
GET /api/users/:id - Kullanıcı detayı     
PUT /api/users/:id - Kullanıcı güncelle      
PATCH /api/users/:id/avatar - Avatar yükle    

Tasks

GET /api/tasks - Tüm görevleri listele    
GET /api/tasks/:id - Görev detayı    
POST /api/tasks - Yeni görev ekle   
PUT /api/tasks/:id - Görev güncelle     
PATCH /api/tasks/:id/status - Görev durumu güncelle    
DELETE /api/tasks/:id - Görev sil    

Comments

GET /api/comments/task/:taskId - Göreve ait yorumlar    
POST /api/comments - Yorum ekle     
PUT /api/comments/:id - Yorum güncelle     
DELETE /api/comments/:id - Yorum sil     

Notifications

GET /api/notifications - Bildirimleri listele    
GET /api/notifications/unread-count - Okunmamış bildirim sayısı      
PATCH /api/notifications/:id/read - Bildirimi okundu işaretle      
POST /api/notifications/mark-all-read - Tümünü okundu işaretle    

Assignments

GET /api/assignments/task/:taskId - Göreve ait atama geçmişi     
GET /api/assignments - Tüm atama kayıtları    

Activities

GET /api/activities/task/:taskId - Göreve ait aktivite logları    
GET /api/activities - Tüm aktiviteler     


🔧 Environment Değişkenleri   

Backend (.env)   

```
PORT=5000   
MONGO_URI=mongodb://localhost:27017/taskflow     
JWT_SECRET=supersecretkey    
```


📧 İletişim

Proje Sahibi - @sezerartug - sartug94@gmail.com

Proje Linki: https://github.com/sezerartug/taskflow

İstenilen Araştırma Konuları Linki : https://docs.google.com/document/d/1TfuSaHbzB56g2CX70EvXjiEQRIkBeIu9BzvyluHCEic/edit?usp=sharing
