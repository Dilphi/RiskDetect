const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Регистрация
exports.register = async (req, res) => {
  console.log('📝 Получены данные регистрации:', req.body); // Логируем
    
  try {
    const { name, email, password, age, gender, occupation } = req.body;
    
    // Проверка обязательных полей
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Заполните все обязательные поля',
        error: 'Missing required fields' 
      });
    }
    
    const existingUser = await Customer.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    
    const user = await Customer.create({
      name,
      email,
      password,
      age: age || null,
      gender: gender || '',
      occupation: occupation || '',
      registrationDate: new Date()
    });
    
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        occupation: user.occupation,
        registrationDate: user.registrationDate,
        riskLevel: user.riskLevel
      }
    });
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({ 
      message: 'Ошибка регистрации', 
      error: error.message 
    });
  }
};

// Логин
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Customer.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        occupation: user.occupation,
        registrationDate: user.registrationDate,
        riskLevel: user.riskLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка входа', error: error.message });
  }
};

// Получить текущего пользователя
exports.getMe = async (req, res) => {
  try {
    const user = await Customer.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновить профиль
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, gender, occupation } = req.body;
    
    const user = await Customer.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    await user.update({ name, age, gender, occupation });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        occupation: user.occupation,
        registrationDate: user.registrationDate,
        riskLevel: user.riskLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: error.message });
  }
};

// Удалить аккаунт
exports.deleteAccount = async (req, res) => {
  try {
    await Customer.destroy({ where: { id: req.userId } });
    res.json({ success: true, message: 'Аккаунт удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления аккаунта', error: error.message });
  }
};