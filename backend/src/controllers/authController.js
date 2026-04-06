const User = require('../models/Customers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Регистрация
exports.register = async (req, res) => {
  try {
    const { name, email, password, age, gender, occupation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const user = new User({
      name,
      email,
      password,
      age,
      gender,
      occupation,
      registrationDate: new Date()
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
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
    res.status(500).json({ message: 'Ошибка регистрации', error: error.message });
  }
};

// Логин
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
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
    const user = await User.findById(req.userId).select('-password');
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
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, age, gender, occupation },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: error.message });
  }
};

// Удалить аккаунт
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ success: true, message: 'Аккаунт удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления аккаунта', error: error.message });
  }
};