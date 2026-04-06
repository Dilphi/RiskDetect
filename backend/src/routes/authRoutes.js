const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');

// Регистрация
router.post('/register', validateRegister, authController.register);

// Логин
router.post('/login', validateLogin, authController.login);

// Получить текущего пользователя (требуется авторизация)
router.get('/me', authMiddleware, authController.getMe);

// Обновить профиль
router.put('/profile', authMiddleware, authController.updateProfile);

// Удалить аккаунт
router.delete('/account', authMiddleware, authController.deleteAccount);

module.exports = router;
