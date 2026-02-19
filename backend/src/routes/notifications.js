const express = require('express');
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

// Tüm route'lar auth middleware'i ile korunuyor
router.use(auth);

// GET /api/notifications - Kullanıcının bildirimlerini getir
router.get('/', notificationController.getMyNotifications);

// GET /api/notifications/unread-count - Okunmamış bildirim sayısı
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/:id/read - Bildirimi okundu işaretle
router.patch('/:id/read', notificationController.markAsRead);

// POST /api/notifications/mark-all-read - Tümünü okundu işaretle
router.post('/mark-all-read', notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Bildirim sil
router.delete('/:id', notificationController.deleteNotification);

// TEST ROUTE - Sadece test için (opsiyonel)
// router.post('/test', notificationController.createTestNotification);

module.exports = router;