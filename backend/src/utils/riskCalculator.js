/**
 * Расчет уровня риска на основе процента результатов тестов
 * @param {number} percentage - процент результата теста (0-100)
 * @returns {string} - уровень риска: 'низкий', 'умеренный', 'высокий'
 */
exports.calculateRiskLevel = (percentage) => {
  if (percentage >= 70) {
    return 'низкий';
  } else if (percentage >= 40) {
    return 'умеренный';
  } else {
    return 'высокий';
  }
};

/**
 * Расчет общего уровня риска на основе всех тестов пользователя
 * @param {Array} tests - массив результатов тестов
 * @returns {string} - уровень риска
 */
exports.calculateOverallRiskLevel = (tests) => {
  if (tests.length === 0) return 'низкий';
  
  const avgPercentage = tests.reduce((sum, test) => sum + test.percentage, 0) / tests.length;
  return exports.calculateRiskLevel(avgPercentage);
};