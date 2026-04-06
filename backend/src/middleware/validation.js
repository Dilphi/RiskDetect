const { body, validationResult } = require('express-validator');

// Валидация регистрации
exports.validateRegister = [
  body('name').notEmpty().withMessage('Имя обязательно').trim(),
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Некорректный возраст'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Валидация логина
exports.validateLogin = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Валидация результата теста
exports.validateTestResult = [
  body('testId').isInt().withMessage('ID теста обязателен'),
  body('testTitle').notEmpty().withMessage('Название теста обязательно'),
  body('score').isInt().withMessage('Оценка должна быть числом'),
  body('maxScore').isInt().withMessage('Максимальная оценка должна быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Валидация записи сна
exports.validateSleepRecord = [
  body('hours').isFloat({ min: 0, max: 24 }).withMessage('Часы сна должны быть от 0 до 24'),
  body('quality').isInt({ min: 1, max: 5 }).withMessage('Качество сна должно быть от 1 до 5'),
  body('notes').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Валидация настроения
exports.validateMood = [
  body('value').isInt({ min: 1, max: 5 }).withMessage('Оценка настроения должна быть от 1 до 5'),
  body('label').notEmpty().withMessage('Название настроения обязательно'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Валидация записи дневника
exports.validateJournalEntry = [
  body('title').notEmpty().withMessage('Заголовок обязателен'),
  body('content').notEmpty().withMessage('Содержание обязательно'),
  body('mood').optional().isInt({ min: 1, max: 5 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
