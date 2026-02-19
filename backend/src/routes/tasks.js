const express = require('express');
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const router = express.Router();

// Tüm task route'ları auth middleware'i ile korunuyor
router.use(auth);

// GET /api/tasks - Tüm görevleri getir
router.get('/', taskController.getAllTasks);

// GET /api/tasks/:id - Tek görev getir
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Yeni görev ekle
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Görev güncelle
router.put('/:id', taskController.updateTask);

// PATCH /api/tasks/:id/status - Görev durumunu güncelle (drag & drop)
router.patch('/:id/status', taskController.updateTaskStatus);

// DELETE /api/tasks/:id - Görev sil
router.delete('/:id', taskController.deleteTask);

module.exports = router;