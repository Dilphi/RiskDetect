const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  battery: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  firmware: {
    type: DataTypes.STRING,
    defaultValue: '1.0.0'
  },
  connectedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'devices',
  timestamps: true
});

module.exports = Device;