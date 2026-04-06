const mongoose = require('mongoose');

const SleepRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, required: true },
  bedTime: { type: Date, required: true },
  wakeTime: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0, max: 24 },
  quality: { type: Number, required: true, min: 1, max: 5 },
  qualityLabel: { type: String },
  qualityEmoji: { type: String },
  qualityColor: { type: String },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SleepRecord', SleepRecordSchema);