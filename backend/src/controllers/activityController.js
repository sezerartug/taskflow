const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');

// Bir göreve ait aktiviteleri getir
exports.getActivitiesByTask = async (req, res) => {
  try {
    const activities = await ActivityLog.find({ taskId: req.params.taskId })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 }); // yeniden eskiye
    
    res.json(activities);
  } catch (err) {
    console.error('Aktiviteler getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm aktiviteleri getir (Dashboard için)
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('userId', 'name email avatar')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(50); // son 50 aktivite
    
    res.json(activities);
  } catch (err) {
    console.error('Aktiviteler getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni aktivite ekle (manuel, ama genelde controller'lardan çağrılacak)
exports.createActivity = async (req, res) => {
  try {
    const { taskId, action, oldValue, newValue } = req.body;
    
    const activity = new ActivityLog({
      taskId,
      userId: req.user._id,
      action,
      oldValue,
      newValue,
      createdAt: new Date()
    });
    
    await activity.save();
    
    res.status(201).json(activity);
  } catch (err) {
    console.error('Aktivite eklenemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};