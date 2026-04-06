const SleepRecord = require('../models/SleepRecord');

// Сохранить запись сна
exports.saveSleepRecord = async (req, res) => {
  try {
    const { date, bedTime, wakeTime, hours, quality, notes } = req.body;

    const sleepRecord = new SleepRecord({
      userId: req.userId,
      date,
      bedTime,
      wakeTime,
      hours,
      quality,
      notes
    });

    await sleepRecord.save();
    res.status(201).json({ success: true, sleepRecord });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сохранения записи сна', error: error.message });
  }
};

// Получить все записи сна
exports.getSleepRecords = async (req, res) => {
  try {
    const records = await SleepRecord.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки записей сна', error: error.message });
  }
};

// Получить статистику сна
exports.getSleepStats = async (req, res) => {
  try {
    const records = await SleepRecord.find({ userId: req.userId });
    
    if (records.length === 0) {
      return res.json({ success: true, stats: { count: 0, avgHours: 0, avgQuality: 0, totalHours: 0 } });
    }

    const totalHours = records.reduce((sum, r) => sum + (r.hours || 0), 0);
    const avgQuality = records.reduce((sum, r) => sum + (r.quality || 0), 0) / records.length;

    const stats = {
      count: records.length,
      avgHours: Math.round((totalHours / records.length) * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки статистики', error: error.message });
  }
};

// Удалить запись сна
exports.deleteSleepRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await SleepRecord.findOneAndDelete({ _id: id, userId: req.userId });
    res.json({ success: true, message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};