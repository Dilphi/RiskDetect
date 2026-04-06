const { MoodEntry } = require('../models');

// Сохранить отметку настроения
exports.saveMood = async (req, res) => {
  try {
    const { value, label, emoji, note } = req.body;

    const moodEntry = await MoodEntry.create({
      id: require('crypto').randomUUID(),
      userId: req.userId,
      value,
      label,
      emoji,
      note: note || ''
    });

    res.status(201).json({ success: true, moodEntry });
  } catch (error) {
    console.error('Ошибка сохранения настроения:', error);
    res.status(500).json({ message: 'Ошибка сохранения настроения', error: error.message });
  }
};

// Получить все записи настроения
exports.getMoodEntries = async (req, res) => {
  try {
    const entries = await MoodEntry.findAll({ 
      where: { userId: req.userId },
      order: [['date', 'DESC']]
    });
    res.json({ success: true, entries });
  } catch (error) {
    console.error('Ошибка загрузки настроения:', error);
    res.status(500).json({ message: 'Ошибка загрузки записей', error: error.message });
  }
};

// Получить статистику настроения
exports.getMoodStats = async (req, res) => {
  try {
    const entries = await MoodEntry.findAll({ where: { userId: req.userId } });
    
    if (entries.length === 0) {
      return res.json({ success: true, stats: { count: 0, avg: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } });
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
    console.error('Ошибка статистики настроения:', error);
    res.status(500).json({ message: 'Ошибка загрузки статистики', error: error.message });
  }
};

// Удалить запись настроения
exports.deleteMoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await MoodEntry.destroy({ where: { id, userId: req.userId } });
    res.json({ success: true, message: 'Запись настроения удалена' });
  } catch (error) {
    console.error('Ошибка удаления настроения:', error);
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};