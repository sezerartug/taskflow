const express = require('express');
const auth = require('../middleware/auth');
const assignmentController = require('../controllers/assignmentController');
const router = express.Router();

// Tüm route'lar auth middleware'i ile korunuyor
router.use(auth);

// GET /api/assignments - Tüm atama kayıtlarını getir
router.get('/', assignmentController.getAllAssignments);

// GET /api/assignments/task/:taskId - Bir göreve ait atama geçmişini getir
router.get('/task/:taskId', assignmentController.getAssignmentsByTask);

// POST /api/assignments - Yeni atama kaydı oluştur (manuel)
router.post('/', assignmentController.createAssignment);

module.exports = router;