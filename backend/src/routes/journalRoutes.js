const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/auth');
const { validateJournalEntry } = require('../middleware/validation');

// Сохранить запись дневника
router.post('/', authMiddleware, validateJournalEntry, journalController.saveEntry);

// Получить все записи дневника
router.get('/', authMiddleware, journalController.getEntries);

// Получить одну запись
router.get('/:id', authMiddleware, journalController.getEntryById);

// Обновить запись
router.put('/:id', authMiddleware, validateJournalEntry, journalController.updateEntry);

// Удалить запись
router.delete('/:id', authMiddleware, journalController.deleteEntry);

module.exports = router;