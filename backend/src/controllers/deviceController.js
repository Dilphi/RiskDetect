const Device = require('../models/Device');

// Сохранить подключенное устройство
exports.saveDevice = async (req, res) => {
  try {
    const { deviceId, name, model, serialNumber, battery, firmware } = req.body;

    const device = new Device({
      userId: req.userId,
      deviceId,
      name,
      model,
      serialNumber,
      battery,
      firmware,
      connectedAt: new Date()
    });

    await device.save();
    res.status(201).json({ success: true, device });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сохранения устройства', error: error.message });
  }
};

// Получить все устройства пользователя
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.userId });
    res.json({ success: true, devices });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки устройств', error: error.message });
  }
};

// Удалить устройство
exports.deleteDevice = async (req, res) => {
  try {
    await Device.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true, message: 'Устройство удалено' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления', error: error.message });
  }
};