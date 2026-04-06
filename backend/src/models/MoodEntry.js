const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  value: { type: Number, required: true, min: 1, max: 5 },
  label: { type: String, required: true },
  emoji: { type: String, required: true },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);