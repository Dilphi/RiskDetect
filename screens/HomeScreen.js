import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/HomeStyles'

export default function HomeScreen({ navigation, userData }) {
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [stats, setStats] = useState({
    testsCompleted: 0,
    avgSleepHours: 0,
    moodScore: 0
  });

  const moodOptions = [
    { id: 1, emoji: '😊', label: 'Отлично', value: 5, color: '#2ecc71' },
    { id: 2, emoji: '🙂', label: 'Хорошо', value: 4, color: '#27ae60' },
    { id: 3, emoji: '😐', label: 'Нормально', value: 3, color: '#f39c12' },
    { id: 4, emoji: '😔', label: 'Плохо', value: 2, color: '#e67e22' },
    { id: 5, emoji: '😢', label: 'Очень плохо', value: 1, color: '#e74c3c' },
  ];

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const testsJson = await AsyncStorage.getItem(`tests_${user?.id}`);
      const sleepJson = await AsyncStorage.getItem(`sleep_${user?.id}`);
      const moodJson = await AsyncStorage.getItem(`mood_${user?.id}`);
      
      const tests = testsJson ? JSON.parse(testsJson) : [];
      const sleepData = sleepJson ? JSON.parse(sleepJson) : [];
      const moodData = moodJson ? JSON.parse(moodJson) : [];
      
      const avgSleep = sleepData.length > 0 
        ? sleepData.reduce((sum, day) => sum + day.hours, 0) / sleepData.length 
        : 0;
      
      const avgMood = moodData.length > 0
        ? moodData.reduce((sum, entry) => sum + entry.value, 0) / moodData.length
        : 0;
      
      setStats({
        testsCompleted: tests.length,
        avgSleepHours: Math.round(avgSleep * 10) / 10,
        moodScore: Math.round(avgMood * 10) / 10
      });
      
      // Загружаем сегодняшнее настроение
      const today = new Date().toDateString();
      const todayMoodEntry = moodData.find(entry => 
        new Date(entry.date).toDateString() === today
      );
      
      if (todayMoodEntry) {
        const moodOption = moodOptions.find(m => m.value === todayMoodEntry.value);
        setTodayMood(moodOption);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadStats()]);
    setRefreshing(false);
  };

  const handleMoodSelect = async (mood) => {
    try {
      setTodayMood(mood);
      
      const moodData = {
        date: new Date().toISOString(),
        value: mood.value,
        label: mood.label,
        emoji: mood.emoji
      };
      
      const moodJson = await AsyncStorage.getItem(`mood_${user?.id}`);
      let moodEntries = moodJson ? JSON.parse(moodJson) : [];
      
      // Удаляем запись за сегодня, если она есть
      const today = new Date().toDateString();
      moodEntries = moodEntries.filter(entry => 
        new Date(entry.date).toDateString() !== today
      );
      
      moodEntries.push(moodData);
      await AsyncStorage.setItem(`mood_${user?.id}`, JSON.stringify(moodEntries));
      
      Alert.alert('Настроение сохранено', `Вы отметили: ${mood.emoji} ${mood.label}`);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить настроение');
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Экстренная помощь',
      'Телефон доверия: 8-800-2000-122\n\nПомощь психолога доступна 24/7',
      [
        { text: 'Позвонить', onPress: () => console.log('Emergency call') },
        { text: 'Чат с психологом', onPress: () => navigation.navigate('Psychologist') },
        { text: 'Отмена', style: 'cancel' }
      ]
    );
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'низкий': return '#2ecc71';
      case 'умеренный': return '#f39c12';
      case 'высокий': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Приветствие */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Привет, {user?.name?.split(' ')[0] || 'Пользователь'}!</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}</Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyIcon}
            onPress={handleEmergency}
          >
            <Ionicons name="alert-circle" size={32} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {/* Риск статус */}
        <TouchableOpacity 
          style={[styles.riskCard, { borderLeftColor: getRiskColor(user?.riskLevel) }]}
          onPress={() => navigation.navigate('Statistics')}
        >
          <View style={styles.riskHeader}>
            <Text style={styles.riskTitle}>Уровень риска</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(user?.riskLevel) }]}>
              <Text style={styles.riskBadgeText}>{user?.riskLevel || 'низкий'}</Text>
            </View>
          </View>
          <Text style={styles.riskDescription}>
            {user?.riskLevel === 'низкий' ? 'Ваше состояние стабильно. Продолжайте следить за собой.' :
             user?.riskLevel === 'умеренный' ? 'Рекомендуется обратить внимание на свое состояние.' :
             'Рекомендуется немедленно обратиться к психологу.'}
          </Text>
          <View style={styles.riskFooter}>
            <Text style={styles.riskLink}>Подробная статистика →</Text>
          </View>
        </TouchableOpacity>

        {/* Настроение */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Как вы себя чувствуете?</Text>
          <Text style={styles.cardSubtitle}>Выберите ваше настроение сегодня</Text>
          
          <View style={styles.moodContainer}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  todayMood?.id === mood.id && styles.moodButtonSelected
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                <View style={[styles.moodEmojiContainer, { backgroundColor: mood.color + '20' }]}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </View>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#3498db20' }]}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Ionicons name="document-text" size={28} color="#3498db" />
            <Text style={styles.statNumber}>{stats.testsCompleted}</Text>
            <Text style={styles.statLabel}>Тестов пройдено</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#9b59b620' }]}
            onPress={() => navigation.navigate('Сон')}
          >
            <Ionicons name="moon" size={28} color="#9b59b6" />
            <Text style={styles.statNumber}>{stats.avgSleepHours} ч</Text>
            <Text style={styles.statLabel}>Сон в среднем</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#e67e2220' }]}
            onPress={() => navigation.navigate('Дневник')}
          >
            <Ionicons name="happy" size={28} color="#e67e22" />
            <Text style={styles.statNumber}>{stats.moodScore}</Text>
            <Text style={styles.statLabel}>Настроение</Text>
          </TouchableOpacity>
        </View>

        {/* Быстрые действия */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Быстрые действия</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Тесты')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#2ecc7120' }]}>
                <Ionicons name="help-circle" size={24} color="#2ecc71" />
              </View>
              <Text style={styles.quickActionText}>Пройти тест</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Journal')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#3498db20' }]}>
                <Ionicons name="book" size={24} color="#3498db" />
              </View>
              <Text style={styles.quickActionText}>Дневник</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Psychologist')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#9b59b620' }]}>
                <Ionicons name="people" size={24} color="#9b59b6" />
              </View>
              <Text style={styles.quickActionText}>Психолог</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Scan')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#e67e2220' }]}>
                <Ionicons name="qr-code" size={24} color="#e67e22" />
              </View>
              <Text style={styles.quickActionText}>Сканер</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Рекомендация дня */}
        <View style={[styles.card, styles.recommendationCard]}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="bulb" size={24} color="#f39c12" />
            <Text style={styles.recommendationTitle}>Рекомендация дня</Text>
          </View>
          <Text style={styles.recommendationText}>
            Сделайте 5 глубоких вдохов. Это поможет снизить уровень стресса и улучшить концентрацию.
          </Text>
        </View>

        {/* Мотивация */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "Забота о себе — это не эгоизм, а необходимость."
          </Text>
          <Text style={styles.quoteAuthor}>— RiskDetect</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}