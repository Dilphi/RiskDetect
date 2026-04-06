import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.28:5000/api'; // Заменить на существующий IP

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

    // Сохраняем токен при логине/регистрации
    if (result.token) {
      await AsyncStorage.setItem('token', result.token);
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
  // ДОБАВЬТЕ ЭТОТ МЕТОД
  getMe() {
    return this.request('/auth/me');
  },
  updateProfile(data) {
    return this.request('/auth/profile', 'PUT', data);
  },
  deleteAccount() {
    return this.request('/auth/account', 'DELETE');
  },

  // Тесты
  saveTestResult(testResult) {
    return this.request('/tests', 'POST', testResult);
  },
  getTests() {
    return this.request('/tests');
  },
  getTestStats() {
    return this.request('/tests/stats');
  },
  deleteTestResult(id) {
    return this.request(`/tests/${id}`, 'DELETE');
  },

  // Сон
  saveSleepRecord(record) {
    return this.request('/sleep', 'POST', record);
  },
  getSleepRecords() {
    return this.request('/sleep');
  },
  getSleepStats() {
    return this.request('/sleep/stats');
  },
  deleteSleepRecord(id) {
    return this.request(`/sleep/${id}`, 'DELETE');
  },

  // Настроение
  saveMood(mood) {
    return this.request('/mood', 'POST', mood);
  },
  getMoodEntries() {
    return this.request('/mood');
  },
  getMoodStats() {
    return this.request('/mood/stats');
  },
  deleteMoodEntry(id) {
    return this.request(`/mood/${id}`, 'DELETE');
  },

  // Дневник
  saveJournalEntry(entry) {
    return this.request('/journal', 'POST', entry);
  },
  getJournalEntries() {
    return this.request('/journal');
  },
  getJournalEntry(id) {
    return this.request(`/journal/${id}`);
  },
  updateJournalEntry(id, data) {
    return this.request(`/journal/${id}`, 'PUT', data);
  },
  deleteJournalEntry(id) {
    return this.request(`/journal/${id}`, 'DELETE');
  },

  // Устройства
  saveDevice(device) {
    return this.request('/devices', 'POST', device);
  },
  getDevices() {
    return this.request('/devices');
  },
  deleteDevice(id) {
    return this.request(`/devices/${id}`, 'DELETE');
  },

  // Статистика
  getStatistics() {
    return this.request('/statistics');
  },
  
  // Выход
  logout() {
    return AsyncStorage.removeItem('token');
  }
};

export default api;