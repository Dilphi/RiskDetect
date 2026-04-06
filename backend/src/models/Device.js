const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, unique: true },
  battery: { type: Number, default: 100, min: 0, max: 100 },
  firmware: { type: String, default: '1.0.0' },
  connectedAt: { type: Date, default: Date.now },
  lastSync: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Device', DeviceSchema);