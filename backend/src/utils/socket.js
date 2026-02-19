let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (socketIo) => {
  io = socketIo;
  
  io.on('connection', (socket) => {

    // Kullanıcı kimlik doğrulaması ve odasına katılma
    socket.on('authenticate', (userId) => {
      if (userId) {
        // Önceki socket bağlantısını temizle
        if (userSockets.has(userId)) {
          const oldSocketId = userSockets.get(userId);
          io.sockets.sockets.get(oldSocketId)?.disconnect();
        }
        
        // Yeni socket'ı kaydet
        userSockets.set(userId, socket.id);
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Kullanıcı bağlantısını kaldır
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io henüz başlatılmadı!');
  }
  return io;
};

// Kullanıcıya bildirim gönder
const emitToUser = (userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    getIo().to(`user_${userId}`).emit(event, data);
    return true;
  }
  return false;
};

// Tüm kullanıcılara bildirim gönder (admin için)
const emitToAll = (event, data) => {
  getIo().emit(event, data);
};

module.exports = { initSocket, getIo, emitToUser, emitToAll };