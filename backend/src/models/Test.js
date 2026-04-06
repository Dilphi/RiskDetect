const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  testId: { type: Number, required: true },
  testTitle: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  level: { type: String, required: true },
  description: { type: String, default: '' },
  recommendations: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', TestResultSchema);