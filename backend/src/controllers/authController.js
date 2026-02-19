const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Kayıt ol
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email zaten kullanılıyor' });
    }
    
    const user = new User({ name, email, password, role });
    await user.save(); // Burada modeldeki pre-save tetiklenecek

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      },
      token
    });
  } catch (err) {
    console.error('❌ Register hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Giriş yap
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' });
    }
    
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // ✅ DÜZELTİLDİ: avatar ve bio eklendi
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar, 
        bio: user.bio        
      },
      token
    });
  } catch (err) {
    console.error('❌ Login hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};