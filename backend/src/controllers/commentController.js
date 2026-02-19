const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { emitToUser } = require('../utils/socket');

// Bir göreve ait yorumları getir
exports.getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('userId', 'name email avatar')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (err) {
    console.error('Yorumlar getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni yorum ekle
exports.createComment = async (req, res) => {
  try {
    const { taskId, content, mentions, attachments, parentId } = req.body;
    
    // Task var mı kontrol et
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }
    
    // Yorumu oluştur
    const comment = new Comment({
      taskId,
      userId: req.user._id,
      content,
      mentions: mentions || [],
      attachments: attachments || [],
      parentId: parentId || null
    });
    
    await comment.save();
    
    // 📝 ACTIVITY LOG: Yorum eklendi
    try {
      await ActivityLog.create({
        taskId,
        userId: req.user._id,
        action: 'comment',
        newValue: 'yorum eklendi',
        createdAt: new Date()
      });
    } catch (activityError) {
      console.error('Activity log hatası:', activityError);
    }
    
    // 📣 BİLDİRİM: Mention varsa bildirim gönder
    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        try {
          const notification = await Notification.create({
            userId: mentionedUserId,
            type: 'mention',
            message: `${req.user.name} sizden bir yorumda bahsetti`,
            read: false,
            relatedId: taskId,
            createdAt: new Date()
          });
          
          // Real-time bildirim
          emitToUser(mentionedUserId.toString(), 'new_notification', notification);
        } catch (notifError) {
          console.error('Bildirim oluşturma hatası:', notifError);
        }
      }
    }
    
    // Populate edilmiş halini getir
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email avatar')
      .populate('mentions', 'name email');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Yorum eklenemedi DETAYLI HATA:', err);
    console.error('Hata adı:', err.name);
    console.error('Hata mesajı:', err.message);
    console.error('Hata stack:', err.stack);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Yorum güncelle
exports.updateComment = async (req, res) => {
  try {
    const { content, mentions, attachments } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Sadece kendi yorumunu güncelleyebilir
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu yorumu düzenleme yetkiniz yok' });
    }
    
    comment.content = content || comment.content;
    comment.mentions = mentions || comment.mentions;
    comment.attachments = attachments || comment.attachments;
    comment.updatedAt = new Date();
    
    await comment.save();
    
    const updatedComment = await Comment.findById(comment._id)
      .populate('userId', 'name email avatar')
      .populate('mentions', 'name email');
    
    res.json(updatedComment);
  } catch (err) {
    console.error('Yorum güncellenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yorum sil
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    
    // Admin veya kendi yorumu
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Bu yorumu silme yetkiniz yok' });
    }
    
    await comment.deleteOne();
    
    res.json({ message: 'Yorum başarıyla silindi' });
  } catch (err) {
    console.error('Yorum silinemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Bir yoruma verilen cevapları getir (thread)
exports.getReplies = async (req, res) => {
  try {
    const replies = await Comment.find({ parentId: req.params.id })
      .populate('userId', 'name email avatar')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 });
    
    res.json(replies);
  } catch (err) {
    console.error('Cevaplar getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};