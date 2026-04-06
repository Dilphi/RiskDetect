const { JournalEntry } = require('../models');

// Сохранить запись дневника
exports.saveEntry = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;

    const entry = await JournalEntry.create({
      id: require('crypto').randomUUID(),
      userId: req.userId,
      title,
      content,
      mood: mood || 3,
      tags: tags || []
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error('Ошибка сохранения записи дневника:', error);
    res.status(500).json({ message: 'Ошибка сохранения записи', error: error.message });
  }
};

// Получить все записи дневника
exports.getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({ 
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, entries });
  } catch (error) {
    console.error('Ошибка загрузки дневника:', error);
    res.status(500).json({ message: 'Ошибка загрузки записей', error: error.message });
  }
};

// Получить одну запись
exports.getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ 
      where: { id: req.params.id, userId: req.userId }
    });
    if (!entry) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    res.json({ success: true, entry });
  } catch (error) {
    console.error('Ошибка загрузки записи:', error);
    res.status(500).json({ message: 'Ошибка загрузки записи', error: error.message });
  }
};

// Обновить запись
exports.updateEntry = async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;
    
    const entry = await JournalEntry.findOne({ 
      where: { id: req.params.id, userId: req.userId }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    await entry.update({
      title,
      content,
      mood: mood || 3,
      tags: tags || [],
      editedAt: new Date()
    });

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Ошибка обновления записи:', error);
    res.status(500).json({ message: 'Ошибка обновления записи', error: error.message });
  }
};

// Удалить запись
exports.deleteEntry = async (req, res) => {
  try {
    await JournalEntry.destroy({ 
      where: { id: req.params.id, userId: req.userId }
    });
    res.json({ success: true, message: 'Запись удалена' });
  } catch (error) {
    console.error('Ошибка удаления записи:', error);
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};