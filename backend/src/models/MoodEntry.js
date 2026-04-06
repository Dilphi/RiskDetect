const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const MoodEntry = sequelize.define('MoodEntry', {
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
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mood_entries',
  timestamps: true
});

module.exports = MoodEntry;