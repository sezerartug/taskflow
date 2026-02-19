const express = require('express');
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const router = express.Router();

// Tüm comment route'ları auth middleware'i ile korunuyor
router.use(auth);

// GET /api/comments/task/:taskId - Bir göreve ait yorumları getir
router.get('/task/:taskId', commentController.getCommentsByTask);

// POST /api/comments - Yeni yorum ekle
router.post('/', commentController.createComment);

// PUT /api/comments/:id - Yorum güncelle
router.put('/:id', commentController.updateComment);

// DELETE /api/comments/:id - Yorum sil
router.delete('/:id', commentController.deleteComment);

// GET /api/comments/:id/replies - Bir yoruma verilen cevapları getir
router.get('/:id/replies', commentController.getReplies);

module.exports = router;