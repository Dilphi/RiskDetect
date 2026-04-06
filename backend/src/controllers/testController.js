const { TestResult, Customer } = require('../models');
const { calculateRiskLevel } = require('../utils/riskCalculator');

// Сохранить результат теста
exports.saveTestResult = async (req, res) => {
  try {
    const { testId, testTitle, score, maxScore, percentage, level, description, recommendations } = req.body;

    const testResult = await TestResult.create({
      id: require('crypto').randomUUID(),
      userId: req.userId,
      testId,
      testTitle,
      score,
      maxScore,
      percentage,
      level,
      description: description || '',
      recommendations: recommendations || []
    });

    // Обновляем уровень риска пользователя
    const riskLevel = calculateRiskLevel(percentage);
    await Customer.update({ riskLevel }, { where: { id: req.userId } });

    res.status(201).json({ success: true, testResult });
  } catch (error) {
    console.error('Ошибка сохранения теста:', error);
    res.status(500).json({ message: 'Ошибка сохранения результата', error: error.message });
  }
};

// Получить все тесты пользователя
exports.getUserTests = async (req, res) => {
  try {
    const tests = await TestResult.findAll({ 
      where: { userId: req.userId },
      order: [['date', 'DESC']]
    });
    res.json({ success: true, tests });
  } catch (error) {
    console.error('Ошибка загрузки тестов:', error);
    res.status(500).json({ message: 'Ошибка загрузки тестов', error: error.message });
  }
};

// Удалить результат теста
exports.deleteTestResult = async (req, res) => {
  try {
    const { id } = req.params;
    await TestResult.destroy({ where: { id, userId: req.userId } });
    res.json({ success: true, message: 'Результат теста удален' });
  } catch (error) {
    console.error('Ошибка удаления теста:', error);
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};

// Получить статистику по тестам
exports.getTestStats = async (req, res) => {
  try {
    const tests = await TestResult.findAll({ where: { userId: req.userId } });
    
    if (tests.length === 0) {
      return res.json({ success: true, stats: { count: 0, avg: 0, best: 0, worst: 0 } });
    }

    const percentages = tests.map(t => t.percentage);
    const stats = {
      count: tests.length,
      avg: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      best: Math.max(...percentages),
      worst: Math.min(...percentages)
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Ошибка статистики тестов:', error);
    res.status(500).json({ message: 'Ошибка загрузки статистики', error: error.message });
  }
};