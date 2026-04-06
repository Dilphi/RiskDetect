const Customer = require('./Customers');
const TestResult = require('./TestResult');
const SleepRecord = require('./SleepRecord');
const MoodEntry = require('./MoodEntry');
const JournalEntry = require('./JournalEntry');
const Device = require('./Device');

// Определение связей
Customer.hasMany(TestResult, { foreignKey: 'userId', onDelete: 'CASCADE' });
TestResult.belongsTo(Customer, { foreignKey: 'userId' });

Customer.hasMany(SleepRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
SleepRecord.belongsTo(Customer, { foreignKey: 'userId' });

Customer.hasMany(MoodEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
MoodEntry.belongsTo(Customer, { foreignKey: 'userId' });

Customer.hasMany(JournalEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
JournalEntry.belongsTo(Customer, { foreignKey: 'userId' });

Customer.hasMany(Device, { foreignKey: 'userId', onDelete: 'CASCADE' });
Device.belongsTo(Customer, { foreignKey: 'userId' });

module.exports = {
  Customer,
  TestResult,
  SleepRecord,
  MoodEntry,
  JournalEntry,
  Device
};