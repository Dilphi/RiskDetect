const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  mood: { type: Number, min: 1, max: 5, default: 3 },
  moodEmoji: { type: String, default: '😐' },
  moodLabel: { type: String, default: 'Нормально' },
  moodColor: { type: String, default: '#f39c12' },
  tags: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
  editedAt: { type: Date, default: null }
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);