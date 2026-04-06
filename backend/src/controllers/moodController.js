const MoodEntry = require('../models/MoodEntry');

// Сохранить отметку настроения
exports.saveMood = async (req, res) => {
  try {
    const { value, label, emoji } = req.body;

    const moodEntry = new MoodEntry({
      userId: req.userId,
      value,
      label,
      emoji,
      date: new Date()
    });

    await moodEntry.save();
    res.status(201).json({ success: true, moodEntry });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сохранения настроения', error: error.message });
  }
};

// Получить все записи настроения
exports.getMoodEntries = async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки записей', error: error.message });
  }
};

// Получить статистику настроения
exports.getMoodStats = async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.userId });
    
    if (entries.length === 0) {
      return res.json({ success: true, stats: { count: 0, avg: 0, distribution: {} } });
    }

    const avg = entries.reduce((sum, e) => sum + e.value, 0) / entries.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(e => distribution[e.value]++);

    res.json({
      success: true,
      stats: {
        count: entries.length,
        avg: Math.round(avg * 10) / 10,
        distribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки статистики', error: error.message });
  }
};