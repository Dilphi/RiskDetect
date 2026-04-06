const { Customer } = require('../models');

// Получить всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Customer.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки пользователей', error: error.message });
  }
};

// Получить пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const user = await Customer.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки пользователя', error: error.message });
  }
};

// Обновить уровень риска
exports.updateRiskLevel = async (req, res) => {
  try {
    const { riskLevel, riskPoints } = req.body;
    const user = await Customer.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    await user.update({ riskLevel, riskPoints });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        riskLevel: user.riskLevel,
        riskPoints: user.riskPoints
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления уровня риска', error: error.message });
  }
};