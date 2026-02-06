import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);

  // Моковые данные пользователя
  const mockUser = {
    id: 1,
    name: 'Алексей',
    age: 15,
    riskLevel: 'умеренный',
    riskPoints: 2,
    lastCheck: '2024-01-15',
    nextCheck: '2024-01-22',
    psychologist: 'Иванова М.П.',
    contact: '+7 (999) 123-45-67'
  };

  // Варианты настроения для сегодня
  const moodOptions = [
    { id: 1, emoji: '😊', label: 'Отлично', value: 'great' },
    { id: 2, emoji: '🙂', label: 'Хорошо', value: 'good' },
    { id: 3, emoji: '😐', label: 'Нормально', value: 'neutral' },
    { id: 4, emoji: '😔', label: 'Плохо', value: 'bad' },
    { id: 5, emoji: '😢', label: 'Очень плохо', value: 'very_bad' },
  ];

  // Моковые данные для графиков/статистики
  const weeklyMoodData = [
    { day: 'Пн', mood: 'good' },
    { day: 'Вт', mood: 'great' },
    { day: 'Ср', mood: 'neutral' },
    { day: 'Чт', mood: 'bad' },
    { day: 'Пт', mood: 'good' },
    { day: 'Сб', mood: 'great' },
    { day: 'Вс', mood: 'good' },
  ];

  // Моковые рекомендации
  const recommendations = [
    'Попробуйте дыхательные упражнения',
    'Рекомендуем прогулку на свежем воздухе',
    'Запишите 3 хорошие вещи за сегодня',
    'Позвоните другу или близкому человеку'
  ];

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMoodSelect = (mood) => {
    setTodayMood(mood);
    Alert.alert(
      'Настроение сохранено',
      `Вы отметили: ${mood.emoji} ${mood.label}`,
      [{ text: 'OK' }]
    );
    
    // Здесь можно добавить логику сохранения в локальное хранилище
    // AsyncStorage.setItem('todayMood', JSON.stringify(mood));
  };

  const handleQuickTest = () => {
    navigation.navigate('Быстрый тест');
  };

  const handleEmergency = () => {
    Alert.alert(
      'Экстренная помощь',
      'Телефон доверия: 8-800-2000-122\n\nПомощь психолога доступна 24/7',
      [
        { text: 'Позвонить', onPress: () => Linking.openURL('tel:88002000122') },
        { text: 'Отмена', style: 'cancel' }
      ]
    );
  };

  const getRiskColor = (points) => {
    if (points === 0) return '#2ecc71'; // зеленый
    if (points <= 2) return '#f39c12'; // оранжевый
    return '#e74c3c'; // красный
  };

  const getMoodColor = (mood) => {
    switch(mood) {
      case 'great': return '#2ecc71';
      case 'good': return '#27ae60';
      case 'neutral': return '#f39c12';
      case 'bad': return '#e67e22';
      case 'very_bad': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Заголовок и приветствие */}
        <View style={styles.header}>
          <Text style={styles.title}>RiskDetect</Text>
          <Text style={styles.greeting}>Привет, {user.name}!</Text>
          <Text style={styles.subtitle}>Мониторинг психологического состояния</Text>
        </View>

        {/* Карточка статуса */}
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Текущий статус</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Уровень риска</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(user.riskPoints) }]}>
                <Text style={styles.riskText}>{user.riskLevel}</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Попыток самоповреждений</Text>
              <Text style={[styles.riskPoints, { color: getRiskColor(user.riskPoints) }]}>
                {user.riskPoints}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Последняя проверка:</Text>
            <Text style={styles.infoValue}>{user.lastCheck}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Следующая проверка:</Text>
            <Text style={styles.infoValue}>{user.nextCheck}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ваш психолог:</Text>
            <Text style={styles.infoValue}>{user.psychologist}</Text>
          </View>
        </View>

        {/* Быстрый опрос настроения */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Как вы себя чувствуете сегодня?</Text>
          <Text style={styles.cardSubtitle}>Выберите вариант:</Text>
          
          <View style={styles.moodContainer}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  todayMood?.id === mood.id && styles.moodButtonSelected,
                  { backgroundColor: getMoodColor(mood.value) }
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Недельная статистика настроения */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Настроение за неделю</Text>
          <View style={styles.weekChart}>
            {weeklyMoodData.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: item.mood === 'great' ? 80 : 
                              item.mood === 'good' ? 60 : 
                              item.mood === 'neutral' ? 40 : 
                              item.mood === 'bad' ? 20 : 10,
                      backgroundColor: getMoodColor(item.mood)
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Рекомендации */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Персональные рекомендации</Text>
          {recommendations.map((item, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Основные кнопки навигации */}
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Профиль')}
          >
            <Text style={styles.navButtonEmoji}>👤</Text>
            <Text style={styles.navButtonText}>Профиль</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Сон')}
          >
            <Text style={styles.navButtonEmoji}>😴</Text>
            <Text style={styles.navButtonText}>Сон</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Тесты')}
          >
            <Text style={styles.navButtonEmoji}>📊</Text>
            <Text style={styles.navButtonText}>Тесты</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Дневник')}
          >
            <Text style={styles.navButtonEmoji}>📝</Text>
            <Text style={styles.navButtonText}>Дневник</Text>
          </TouchableOpacity>
        </View>

        {/* Быстрые действия */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.testButton]}
            onPress={handleQuickTest}
          >
            <Text style={styles.actionButtonText}>Пройти быстрый тест</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={handleEmergency}
          >
            <Text style={styles.actionButtonText}>Экстренная помощь</Text>
          </TouchableOpacity>
        </View>

        {/* Информация о системе */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Система RiskDetect анализирует ваше состояние и предоставляет рекомендации. 
            Данные обрабатываются анонимно.
          </Text>
          <Text style={styles.version}>Версия 1.0.0</Text>
        </View>
      </ScrollView>
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
    padding: 16,
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 100,
  },
  riskText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  riskPoints: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodButtonSelected: {
    borderWidth: 3,
    borderColor: '#2c3e50',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  chartColumn: {
    alignItems: 'center',
    width: '12%',
  },
  chartBar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#2ecc71',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#3498db',
  },
  emergencyButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  version: {
    fontSize: 11,
    color: '#bdc3c7',
  },
});