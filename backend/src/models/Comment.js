const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String },
    size: { type: Number, max: 15 * 1024 * 1024 } // 15MB max
  }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});


module.exports = mongoose.model('Comment', commentSchema);