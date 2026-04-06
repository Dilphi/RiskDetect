const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const TestResult = sequelize.define('TestResult', {
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
  testId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  testTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxScore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  percentage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  recommendations: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('recommendations');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('recommendations', JSON.stringify(value));
    }
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'test_results',
  timestamps: true
});

module.exports = TestResult;