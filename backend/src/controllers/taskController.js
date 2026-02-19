const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');
const { emitToUser } = require('../utils/socket');

// Tüm görevleri getir
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email avatar').populate('createdBy', 'name');
    res.json(tasks);
  } catch (err) {
    console.error('Görevler getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tek görev getir
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name');
    
    if (!task) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }
    
    res.json(task);
  } catch (err) {
    console.error('Görev getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni görev ekle
exports.createTask = async (req, res) => {
  try {
    const { title, description, date, status, priority, assignedTo, tags } = req.body;
    
    // req.user kontrolü
    if (!req.user || !req.user._id) {
      console.error('Kullanıcı bilgisi bulunamadı:', req.user);
      return res.status(401).json({ message: 'Yetkisiz erişim - kullanıcı bilgisi yok' });
    }

    const task = new Task({
      title,
      description,
      date,
      status,
      priority,
      assignedTo: assignedTo || [],
      tags: tags || [],
      createdBy: req.user._id
    });
    
    await task.save();
    
    // 📝 ACTIVITY LOG: Görev oluşturuldu
    await ActivityLog.create({
      taskId: task._id,
      userId: req.user._id,
      action: 'create',
      newValue: title,
      createdAt: new Date()
    });

    // 📋 ASSIGNMENT KAYDI: Atama geçmişine ekle
    if (assignedTo && assignedTo.length > 0) {
      await Assignment.create({
        taskId: task._id,
        assignedBy: req.user._id,
        newAssignees: assignedTo,
        createdAt: new Date()
      });
      
      // 📣 BİLDİRİM: Yeni atananlara bildirim gönder
      for (const assigneeId of assignedTo) {
        const notification = await Notification.create({
          userId: assigneeId,
          type: 'assignment',
          message: `${req.user.name} size yeni bir görev atadı: "${title}"`,
          read: false,
          relatedId: task._id,
          createdAt: new Date()
        });
        
        // Real-time bildirim
        emitToUser(assigneeId.toString(), 'new_notification', notification);
      }
    }
    
    // Populate edilmiş halini gönder
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedTask);
  } catch (err) {
    console.error('Görev eklenemedi HATA:', err);
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
};

// Görev güncelle
exports.updateTask = async (req, res) => {
  try {
    const { title, description, date, status, priority, assignedTo, tags } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }
    
    // Değişiklikleri kontrol et ve logla
    const changes = [];
    
    // Başlık değişti mi?
    if (title && title !== task.title) {
      changes.push({
        action: 'title',
        oldValue: task.title,
        newValue: title
      });
      task.title = title;
    }
    
    // Açıklama değişti mi?
    if (description !== undefined && description !== task.description) {
      changes.push({
        action: 'description',
        oldValue: task.description,
        newValue: description
      });
      task.description = description;
    }
    
    // Tarih değişti mi?
    if (date && date !== task.date) {
      changes.push({
        action: 'date',
        oldValue: task.date,
        newValue: date
      });
      task.date = date;
    }
    
    // Durum değişti mi?
    if (status && status !== task.status) {
      changes.push({
        action: 'status',
        oldValue: task.status,
        newValue: status
      });
      task.status = status;
    }
    
    // Öncelik değişti mi?
    if (priority && priority !== task.priority) {
      changes.push({
        action: 'priority',
        oldValue: task.priority,
        newValue: priority
      });
      task.priority = priority;
    }
    
    // Atanan kişiler değişti mi?
    if (assignedTo) {
      const oldAssignees = task.assignedTo.map(id => id.toString());
      const newAssignees = assignedTo.map(id => id.toString());
      
      // Eklenenler
      const added = newAssignees.filter(id => !oldAssignees.includes(id));
      if (added.length > 0) {
        changes.push({
          action: 'assign_add',
          newValue: added.join(', ')
        });
        
        // 📋 ASSIGNMENT KAYDI: Yeni atama kaydı oluştur
        await Assignment.create({
          taskId: task._id,
          assignedBy: req.user._id,
          newAssignees: added,
          createdAt: new Date()
        });
        
        // 📣 BİLDİRİM: Yeni atananlara bildirim gönder
        for (const assigneeId of added) {
          const notification = await Notification.create({
            userId: assigneeId,
            type: 'assignment',
            message: `${req.user.name} size bir görev atadı: "${task.title}"`,
            read: false,
            relatedId: task._id,
            createdAt: new Date()
          });
          
          // Real-time bildirim
          emitToUser(assigneeId.toString(), 'new_notification', notification);
        }
      }
      
      // Çıkarılanlar
      const removed = oldAssignees.filter(id => !newAssignees.includes(id));
      if (removed.length > 0) {
        changes.push({
          action: 'assign_remove',
          oldValue: removed.join(', ')
        });
      }
      
      task.assignedTo = assignedTo;
    }
    
    // Etiketler değişti mi?
    if (tags) {
      const oldTags = task.tags.join(', ');
      const newTags = tags.join(', ');
      if (oldTags !== newTags) {
        changes.push({
          action: 'tags',
          oldValue: oldTags,
          newValue: newTags
        });
      }
      task.tags = tags;
    }
    
    await task.save();
    
    // 📝 ACTIVITY LOG: Tüm değişiklikleri logla
    for (const change of changes) {
      await ActivityLog.create({
        taskId: task._id,
        userId: req.user._id,
        action: change.action,
        oldValue: change.oldValue,
        newValue: change.newValue,
        createdAt: new Date()
      });
    }
    
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name');
    
    res.json(updatedTask);
  } catch (err) {
    console.error('Görev güncellenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Görev sil
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }
    
    // 📝 ACTIVITY LOG: Görev silindi (silmeden ÖNCE logla)
    await ActivityLog.create({
      taskId: task._id,
      userId: req.user._id,
      action: 'delete',
      oldValue: task.title,
      createdAt: new Date()
    });
    
    await task.deleteOne();
    
    res.json({ message: 'Görev başarıyla silindi' });
  } catch (err) {
    console.error('Görev silinemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Görev durumunu güncelle (drag & drop için)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }
    
    const oldStatus = task.status;
    task.status = status;
    await task.save();
    
    // 📝 ACTIVITY LOG: Durum değişikliği
    await ActivityLog.create({
      taskId: task._id,
      userId: req.user._id,
      action: 'status',
      oldValue: oldStatus,
      newValue: status,
      createdAt: new Date()
    });
    
    res.json(task);
  } catch (err) {
    console.error('Görev durumu güncellenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};