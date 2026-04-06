const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/auth');

// Сохранить подключенное устройство
router.post('/', authMiddleware, deviceController.saveDevice);

// Получить все устройства пользователя
router.get('/', authMiddleware, deviceController.getDevices);

// Обновить статус устройства
router.put('/:id', authMiddleware, deviceController.updateDevice);

// Удалить устройство
router.delete('/:id', authMiddleware, deviceController.deleteDevice);

module.exports = router;