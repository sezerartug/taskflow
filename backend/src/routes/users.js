const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload'); // Multer middleware
const router = express.Router();

// Tüm route'lar auth middleware'i ile korunuyor
router.use(auth);

// GET /api/users - Tüm kullanıcıları getir
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Tek kullanıcı getir
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Kullanıcı güncelle
router.put('/:id', userController.updateUser);

// ✅ MULTER İLE AVATAR YÜKLEME
router.patch('/:id/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;