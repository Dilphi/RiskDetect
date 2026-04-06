const JournalEntry = require('../models/JournalEntry');

// Сохранить запись дневника
exports.saveEntry = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;

    const entry = new JournalEntry({
      userId: req.userId,
      title,
      content,
      mood,
      tags: tags || [],
      date: new Date()
    });

    await entry.save();
    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сохранения записи', error: error.message });
  }
};

// Получить все записи дневника
exports.getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки записей', error: error.message });
  }
};

// Получить одну запись
exports.getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.userId });
    if (!entry) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки записи', error: error.message });
  }
};

// Обновить запись
exports.updateEntry = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;
    
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, mood, tags, editedAt: new Date() },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления записи', error: error.message });
  }
};

// Удалить запись
exports.deleteEntry = async (req, res) => {
  try {
    await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true, message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};