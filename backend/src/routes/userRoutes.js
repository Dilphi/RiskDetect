const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/userController');

// Получить всех пользователей (для админа)
router.get('/', authMiddleware, userController.getAllUsers);

// Получить пользователя по ID
router.get('/:id', authMiddleware, userController.getUserById);

// Обновить уровень риска
router.put('/:id/risk', authMiddleware, userController.updateRiskLevel);

module.exports = router;
