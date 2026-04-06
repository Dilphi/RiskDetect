const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const SleepRecord = sequelize.define('SleepRecord', {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  bedTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  wakeTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hours: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 24
    }
  },
  quality: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  qualityLabel: {
    type: DataTypes.STRING
  },
  qualityEmoji: {
    type: DataTypes.STRING
  },
  qualityColor: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'sleep_records',
  timestamps: true
});

module.exports = SleepRecord;