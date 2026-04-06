const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['Мужской', 'Женский', 'Другой', ''], default: '' },
  occupation: { type: String, default: '' },
  registrationDate: { type: Date, default: Date.now },
  riskLevel: { type: String, enum: ['низкий', 'умеренный', 'высокий'], default: 'низкий' },
  riskPoints: { type: Number, default: 0 },
  avatar: { type: String, default: null } // base64 или URL
});

// Хеширование пароля перед сохранением
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Сравнение пароля
CustomerSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Customer', CustomerSchema);