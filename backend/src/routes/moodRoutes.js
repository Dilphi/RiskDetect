const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const authMiddleware = require('../middleware/auth');
const { validateMood } = require('../middleware/validation');

// Сохранить отметку настроения
router.post('/', authMiddleware, validateMood, moodController.saveMood);

// Получить все записи настроения
router.get('/', authMiddleware, moodController.getMoodEntries);

// Получить статистику настроения
router.get('/stats', authMiddleware, moodController.getMoodStats);

// Удалить запись настроения
router.delete('/:id', authMiddleware, moodController.deleteMoodEntry);

module.exports = router;
