const express = require('express');
const auth = require('../middleware/auth');
const activityController = require('../controllers/activityController');
const router = express.Router();

// Tüm route'lar auth middleware'i ile korunuyor
router.use(auth);

// GET /api/activities - Tüm aktiviteleri getir (Dashboard)
router.get('/', activityController.getAllActivities);

// GET /api/activities/task/:taskId - Bir göreve ait aktiviteleri getir
router.get('/task/:taskId', activityController.getActivitiesByTask);

// POST /api/activities - Yeni aktivite ekle (manuel)
router.post('/', activityController.createActivity);

module.exports = router;