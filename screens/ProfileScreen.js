import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ route, navigation, userData }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Моковые данные пользователя (с защитой от null)
  const mockUser = userData || {
    id: 1,
    name: 'Алексей Иванов',
    email: 'alexey@example.com',
    age: 15,
    role: 'student',
    psychologist: 'Иванова Мария Петровна',
    psychologistContact: '+7 (999) 123-45-67',
    school: 'Школа №123',
    grade: '9 класс',
    registrationDate: '2024-01-10',
    riskPoints: 2,
    riskLevel: 'умеренный',
    lastCheck: '2024-01-15',
    nextCheck: '2024-01-22',
    status: 'активен'
  };

  const sleepData = [
    { day: 'Пн', hours: 7.5, quality: 'хорошо' },
    { day: 'Вт', hours: 6.8, quality: 'нормально' },
    { day: 'Ср', hours: 8.2, quality: 'отлично' },
    { day: 'Чт', hours: 5.5, quality: 'плохо' },
    { day: 'Пт', hours: 7.0, quality: 'хорошо' },
    { day: 'Сб', hours: 9.0, quality: 'отлично' },
    { day: 'Вс', hours: 7.8, quality: 'хорошо' }
  ];

  const testHistory = [
    { date: '15.01.2024', test: 'Шкала депрессии', result: 'Средний уровень', score: 12 },
    { date: '10.01.2024', test: 'Тревожность', result: 'Низкий уровень', score: 8 },
    { date: '05.01.2024', test: 'Стресс', result: 'Высокий уровень', score: 18 }
  ];

  useEffect(() => {
    // Имитация загрузки
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getRiskColor = (level) => {
    if (!level) return '#95a5a6';
    switch (level.toLowerCase()) {
      case 'низкий': return '#2ecc71';
      case 'умеренный': return '#f39c12';
      case 'высокий': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getSleepQualityColor = (quality) => {
    if (!quality) return '#95a5a6';
    switch (quality.toLowerCase()) {
      case 'отлично': return '#2ecc71';
      case 'хорошо': return '#27ae60';
      case 'нормально': return '#f39c12';
      case 'плохо': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    Alert.alert('Выход выполнен', 'Вы успешно вышли из системы');
    if (navigation) {
      navigation.navigate('Auth');
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Экстренная помощь',
      'Позвонить психологу?',
      [
        { text: 'Позвонить', onPress: () => console.log('Calling psychologist...') },
        { text: 'Отмена', style: 'cancel' }
      ]
    );
  };

  const renderProfileTab = () => {
    // Защита от null
    if (!user) return null;
    
    return (
      <View style={styles.tabContent}>
        {/* Карточка пользователя */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0) || 'П'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{user.name || 'Пользователь'}</Text>
          <Text style={styles.userEmail}>{user.email || 'email@example.com'}</Text>
          <Text style={styles.userRole}>
            {user.role === 'student' ? 'Ученик' : user.role || 'Пользователь'}
          </Text>
        </View>

        {/* Статистика */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Статистика</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                <Text style={{ color: getRiskColor(user.riskLevel) }}>
                  {user.riskPoints || 0}
                </Text>
              </Text>
              <Text style={styles.statLabel}>Попыток</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{testHistory.length}</Text>
              <Text style={styles.statLabel}>Тестов пройдено</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {sleepData.reduce((acc, day) => acc + day.hours, 0) / sleepData.length | 0} ч
              </Text>
              <Text style={styles.statLabel}>Сон в среднем</Text>
            </View>
          </View>
        </View>

        {/* Информация */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Информация</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Возраст:</Text>
            <Text style={styles.infoValue}>{user.age || 'Не указан'} лет</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Школа:</Text>
            <Text style={styles.infoValue}>{user.school || 'Не указана'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Класс:</Text>
            <Text style={styles.infoValue}>{user.grade || 'Не указан'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Психолог:</Text>
            <Text style={styles.infoValue}>{user.psychologist || 'Не назначен'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.psychologistButton}
            onPress={handleEmergencyCall}
          >
            <Ionicons name="call" size={20} color="#3498db" />
            <Text style={styles.psychologistButtonText}>Связаться с психологом</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSleepTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sleepCard}>
        <Text style={styles.cardTitle}>Мониторинг сна</Text>
        <Text style={styles.sleepSubtitle}>Среднее время сна за неделю: 7.4 часа</Text>
        
        <View style={styles.sleepChart}>
          {sleepData.map((day, index) => (
            <View key={index} style={styles.sleepBarContainer}>
              <View style={styles.sleepBarColumn}>
                <View 
                  style={[
                    styles.sleepBar,
                    { 
                      height: day.hours * 15,
                      backgroundColor: getSleepQualityColor(day.quality)
                    }
                  ]}
                />
                <Text style={styles.sleepBarLabel}>{day.hours}ч</Text>
              </View>
              <Text style={styles.sleepDayLabel}>{day.day}</Text>
              <Text style={[styles.sleepQuality, { color: getSleepQualityColor(day.quality) }]}>
                {day.quality}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.sleepTips}>
          <Text style={styles.tipsTitle}>Рекомендации по сну:</Text>
          <Text style={styles.tip}>• Ложитесь спать в одно время</Text>
          <Text style={styles.tip}>• Избегайте экранов за час до сна</Text>
          <Text style={styles.tip}>• Поддерживайте 7-9 часов сна</Text>
        </View>
      </View>
    </View>
  );

  const renderTestsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.testsCard}>
        <Text style={styles.cardTitle}>История тестов</Text>
        
        {testHistory.map((test, index) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.test}</Text>
              <Text style={styles.testDate}>{test.date}</Text>
            </View>
            
            <View style={styles.testResultRow}>
              <View style={styles.resultBadge}>
                <Text style={styles.resultText}>{test.result}</Text>
              </View>
              <Text style={styles.testScore}>Баллы: {test.score}</Text>
            </View>
          </View>
        ))}
        
        <TouchableOpacity style={styles.newTestButton}>
          <Ionicons name="add-circle-outline" size={20} color="#2ecc71" />
          <Text style={styles.newTestButtonText}>Пройти новый тест</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Настройки</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#3498db" />
            <Text style={styles.settingLabel}>Уведомления</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color="#9b59b6" />
            <Text style={styles.settingLabel}>Тёмная тема</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed-outline" size={24} color="#2c3e50" />
            <Text style={styles.settingLabel}>Конфиденциальность</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="help-circle-outline" size={24} color="#f39c12" />
            <Text style={styles.settingLabel}>Помощь и поддержка</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  // Если user все еще null после загрузки
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка загрузки профиля</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setUser(mockUser)}
        >
          <Text style={styles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Мой профиль</Text>
          <Text style={styles.subtitle}>Управление аккаунтом и данными</Text>
        </View>

        {/* Вкладки */}
        <View style={styles.tabsContainer}>
          {[
            { id: 'profile', label: 'Профиль', icon: 'person-outline' },
            { id: 'sleep', label: 'Сон', icon: 'moon-outline' },
            { id: 'tests', label: 'Тесты', icon: 'document-text-outline' },
            { id: 'settings', label: 'Настройки', icon: 'settings-outline' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? '#2ecc71' : '#95a5a6'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Контент вкладок */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'sleep' && renderSleepTab()}
        {activeTab === 'tests' && renderTestsTab()}
        {activeTab === 'settings' && renderSettingsTab()}

        {/* Информация о системе */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            RiskDetect • Версия 1.0.0 • Данные защищены
          </Text>
        </View>
      </ScrollView>

      {/* Модальное окно выхода */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выход из системы</Text>
            <Text style={styles.modalText}>
              Вы уверены, что хотите выйти из аккаунта?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalButtonConfirmText}>Выйти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#f9fff9',
  },
  tabText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 12,
    color: '#3498db',
    backgroundColor: '#ebf5fb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  psychologistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebf5fb',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  psychologistButtonText: {
    marginLeft: 8,
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  sleepCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sleepSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  sleepChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    height: 200,
    alignItems: 'flex-end',
  },
  sleepBarContainer: {
    alignItems: 'center',
    width: '14%',
  },
  sleepBarColumn: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepBar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 4,
  },
  sleepBarLabel: {
    fontSize: 10,
    color: '#2c3e50',
    fontWeight: '500',
  },
  sleepDayLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  sleepQuality: {
    fontSize: 10,
    fontWeight: '500',
  },
  sleepTips: {
    backgroundColor: '#f9fff9',
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  testsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  testItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  testDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  testResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  testScore: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  newTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fff9',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2ecc71',
    borderStyle: 'dashed',
  },
  newTestButtonText: {
    marginLeft: 8,
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutButtonText: {
    marginLeft: 8,
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  modalButtonCancelText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonConfirm: {
    backgroundColor: '#e74c3c',
  },
  modalButtonConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});