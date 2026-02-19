const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Tüm kullanıcıları getir
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tek kullanıcı getir
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcı güncelle
exports.updateUser = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    if (user._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Yetkisiz işlem' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    // Not: avatar burada güncellenmiyor, uploadAvatar ile güncelleniyor

    await user.save();
    
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// ✅ MULTER İLE AVATAR YÜKLEME
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Yetkisiz işlem' });
    }

    // Eski avatar varsa sil
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Yeni avatar yolunu kaydet
    const avatarUrl = `/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Avatar yükleme hatası:', err);
    res.status(500).json({ message: 'Dosya yüklenemedi' });
  }
};