const Assignment = require('../models/Assignment');
const Task = require('../models/Task');

// Bir göreve ait atama geçmişini getir
exports.getAssignmentsByTask = async (req, res) => {
  try {
    const assignments = await Assignment.find({ taskId: req.params.taskId })
      .populate('assignedBy', 'name email avatar')
      .populate('newAssignees', 'name email avatar')
      .sort({ createdAt: -1 }); // yeniden eskiye
    
    res.json(assignments);
  } catch (err) {
    console.error('Atama geçmişi getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Tüm atama kayıtlarını getir (opsiyonel)
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('assignedBy', 'name email')
      .populate('newAssignees', 'name email')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(assignments);
  } catch (err) {
    console.error('Atama kayıtları getirilemedi:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Manuel atama kaydı oluştur (genelde controller'lardan çağrılacak)
exports.createAssignment = async (req, res) => {
  try {
    const { taskId, newAssignees } = req.body;
    
    // Task var mı kontrol et
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Görev bulunamadı' });
    }
    
    const assignment = new Assignment({
      taskId,
      assignedBy: req.user._id,
      newAssignees: newAssignees || [],
      createdAt: new Date()
    });
    
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('assignedBy', 'name email avatar')
      .populate('newAssignees', 'name email avatar');
    
    res.status(201).json(populatedAssignment);
  } catch (err) {
    console.error('Atama kaydı oluşturulamadı:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};