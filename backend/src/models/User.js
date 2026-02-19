const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Project Manager', 'Developer'], default: 'Developer' },
  avatar: { type: String },
  bio: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Şifreyi kaydetmeden önce hashle (DÜZELTİLDİ)
userSchema.pre('save', async function() {
  // Şifre alanı değişmemişse (veya yeni değilse) işlemi atla
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('❌ Hashing Hatası:', error);
    throw error; // Hatayı fırlat ki Mongoose kaydı durdursun
  }
});

// ✅ Şifre karşılaştırma metodu (DÜZELTİLDİ)
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);