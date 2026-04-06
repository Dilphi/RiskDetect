import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://ваш-ip:5000/api'; // Заменить на существующий IP

const api = {
  async request(endpoint, method = 'GET', data = null) {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const config = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Ошибка запроса');
    }

    return result;
  },

  // Auth
  register(userData) {
    return this.request('/auth/register', 'POST', userData);
  },
  login(credentials) {
    return this.request('/auth/login', 'POST', credentials);
  },

  // Тесты
  saveTestResult(testResult) {
    return this.request('/tests', 'POST', testResult);
  },
  getTests() {
    return this.request('/tests');
  },

  // Сон
  saveSleepRecord(record) {
    return this.request('/sleep', 'POST', record);
  },
  getSleepRecords() {
    return this.request('/sleep');
  },

  // Настроение
  saveMood(mood) {
    return this.request('/mood', 'POST', mood);
  },
  getMoodEntries() {
    return this.request('/mood');
  },

  // Дневник
  saveJournalEntry(entry) {
    return this.request('/journal', 'POST', entry);
  },
  getJournalEntries() {
    return this.request('/journal');
  },

  // Устройства
  saveDevice(device) {
    return this.request('/devices', 'POST', device);
  },
  getDevices() {
    return this.request('/devices');
  },

  // Статистика
  getStatistics() {
    return this.request('/statistics');
  }
};

export default api;