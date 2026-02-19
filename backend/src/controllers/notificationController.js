const Notification = require('../models/Notification');
const { emitToUser } = require('../utils/socket');

// Kullanıcının bildirimlerini getir
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (err) {
    console.error('Bildirimler getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Okunmamış bildirim sayısını getir
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user._id, 
      read: false 
    });
    
    res.json({ count });
  } catch (err) {
    console.error('Okunmamış sayısı getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu bildirimi işaretleme yetkiniz yok' });
    }
    
    notification.read = true;
    await notification.save();
    
    // Real-time güncelleme
    emitToUser(req.user._id.toString(), 'notification_read', { id: notification._id });
    
    res.json({ message: 'Bildirim okundu olarak işaretlendi' });
  } catch (err) {
    console.error('Bildirim işaretlenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm bildirimleri okundu olarak işaretle
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    
    // Real-time güncelleme
    emitToUser(req.user._id.toString(), 'all_notifications_read', {});
    
    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (err) {
    console.error('Bildirimler işaretlenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bildirim sil
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Bildirim bulunamadı' });
    }
    
    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu bildirimi silme yetkiniz yok' });
    }
    
    await notification.deleteOne();
    
    // Real-time güncelleme
    emitToUser(req.user._id.toString(), 'notification_deleted', { id: notification._id });
    
    res.json({ message: 'Bildirim silindi' });
  } catch (err) {
    console.error('Bildirim silinemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bildirim oluştur (yardımcı fonksiyon)
exports.createNotification = async (userId, type, message, relatedId) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      read: false,
      relatedId,
      createdAt: new Date()
    });
    
    await notification.save();
    
    // Real-time bildirim gönder
    emitToUser(userId.toString(), 'new_notification', notification);
    
    return notification;
  } catch (err) {
    console.error('Bildirim oluşturulamadı:', err);
    return null;
  }
};