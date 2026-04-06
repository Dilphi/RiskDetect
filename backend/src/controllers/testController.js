const TestResult = require('../models/Test');
const { calculateRiskLevel } = require('../utils/riskCalculator');

// Сохранить результат теста
exports.saveTestResult = async (req, res) => {
  try {
    const { testId, testTitle, score, maxScore, percentage, level, description, recommendations } = req.body;

    const testResult = new TestResult({
      userId: req.userId,
      testId,
      testTitle,
      score,
      maxScore,
      percentage,
      level,
      description,
      recommendations,
      date: new Date()
    });

    await testResult.save();

    // Обновляем уровень риска пользователя
    const riskLevel = calculateRiskLevel(percentage);
    await User.findByIdAndUpdate(req.userId, { riskLevel });

    res.status(201).json({ success: true, testResult });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сохранения результата', error: error.message });
  }
};

// Получить все тесты пользователя
exports.getUserTests = async (req, res) => {
  try {
    const tests = await TestResult.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки тестов', error: error.message });
  }
};

// Получить статистику по тестам
exports.getTestStats = async (req, res) => {
  try {
    const tests = await TestResult.find({ userId: req.userId });
    
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
    res.status(500).json({ message: 'Ошибка загрузки статистики', error: error.message });
  }
};