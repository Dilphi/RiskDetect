const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING, // Убираем ENUM
    defaultValue: ''
  },
  occupation: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  riskLevel: {
    type: DataTypes.STRING, // Убираем ENUM
    defaultValue: 'низкий'
  },
  riskPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        customer.password = await bcrypt.hash(customer.password, 10);
      }
    }
  }
});

Customer.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Customer;