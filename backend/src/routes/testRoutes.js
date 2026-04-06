const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/auth');
const { validateTestResult } = require('../middleware/validation');

// Сохранить результат теста
router.post('/', authMiddleware, validateTestResult, testController.saveTestResult);

// Получить все тесты пользователя
router.get('/', authMiddleware, testController.getUserTests);

// Получить статистику по тестам
router.get('/stats', authMiddleware, testController.getTestStats);

// Удалить результат теста
router.delete('/:id', authMiddleware, testController.deleteTestResult);

module.exports = router;