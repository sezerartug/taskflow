const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Bekliyor', 'Devam Ediyor', 'Tamamlandı'], 
    default: 'Bekliyor' 
  },
  priority: { 
    type: String, 
    enum: ['Düşük', 'Orta', 'Yüksek'], 
    default: 'Orta' 
  },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  commentsCount: { type: Number, default: 0 },
  attachmentsCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);