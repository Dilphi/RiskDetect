const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log // Включим логирование для отладки
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite база данных подключена');
    
    // Синхронизация с принудительным созданием таблиц
    await sequelize.sync({ force: true }); // force: true пересоздаст таблицы
    console.log('✅ Модели синхронизированы (таблицы созданы)');
  } catch (error) {
    console.error('❌ Ошибка подключения к БД:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };