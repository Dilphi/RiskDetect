const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleepController');
const authMiddleware = require('../middleware/auth');
const { validateSleepRecord } = require('../middleware/validation');

// Сохранить запись сна
router.post('/', authMiddleware, validateSleepRecord, sleepController.saveSleepRecord);

// Получить все записи сна
router.get('/', authMiddleware, sleepController.getSleepRecords);

// Получить статистику сна
router.get('/stats', authMiddleware, sleepController.getSleepStats);

// Удалить запись сна
router.delete('/:id', authMiddleware, sleepController.deleteSleepRecord);

module.exports = router;
