const User = require('../models/Customers');

// Получить всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки пользователей', error: error.message });
  }
};

// Получить пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { riskLevel, riskPoints },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления уровня риска', error: error.message });
  }
};