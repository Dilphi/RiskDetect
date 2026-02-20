import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Alert,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/HomeStyles';

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
  const { theme } = useTheme();

  // Настройка навигационной панели
  useEffect(() => {
    if (Platform.OS === 'android') {
      const configureNavigationBar = async () => {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setButtonStyleAsync(
            theme.dark ? 'light' : 'dark'
          );
        } catch (error) {
          console.error('Error configuring navigation bar:', error);
        }
      };

      configureNavigationBar();

    }
  }, [theme.dark]);

  const moodOptions = [
    { id: 1, emoji: '😊', label: 'Отлично', value: 5, color: theme.colors.success },
    { id: 2, emoji: '🙂', label: 'Хорошо', value: 4, color: theme.colors.success },
    { id: 3, emoji: '😐', label: 'Нормально', value: 3, color: theme.colors.warning },
    { id: 4, emoji: '😔', label: 'Плохо', value: 2, color: theme.colors.warning },
    { id: 5, emoji: '😢', label: 'Очень плохо', value: 1, color: theme.colors.error },
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
      case 'низкий': return theme.colors.success;
      case 'умеренный': return theme.colors.warning;
      case 'высокий': return theme.colors.error;
      default: return theme.colors.lightGray;
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Приветствие */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              Привет, {user?.name?.split(' ')[0] || 'Пользователь'}!
            </Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {new Date().toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.emergencyIcon}
            onPress={handleEmergency}
          >
            <Ionicons name="alert-circle" size={32} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        {/* Риск статус */}
        <TouchableOpacity 
          style={[styles.riskCard, { 
            borderLeftColor: getRiskColor(user?.riskLevel),
            backgroundColor: theme.colors.card 
          }]}
          onPress={() => navigation.navigate('Statistics')}
        >
          <View style={styles.riskHeader}>
            <Text style={[styles.riskTitle, { color: theme.colors.text }]}>Уровень риска</Text>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(user?.riskLevel) }]}>
              <Text style={[styles.riskBadgeText, { color: theme.colors.white }]}>
                {user?.riskLevel || 'низкий'}
              </Text>
            </View>
          </View>
          <Text style={[styles.riskDescription, { color: theme.colors.textSecondary }]}>
            {user?.riskLevel === 'низкий' ? 'Ваше состояние стабильно. Продолжайте следить за собой.' :
             user?.riskLevel === 'умеренный' ? 'Рекомендуется обратить внимание на свое состояние.' :
             'Рекомендуется немедленно обратиться к психологу.'}
          </Text>
          <View style={styles.riskFooter}>
            <Text style={[styles.riskLink, { color: theme.colors.primary }]}>
              Подробная статистика →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Настроение */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Как вы себя чувствуете?
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            Выберите ваше настроение сегодня
          </Text>
          
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
                <Text style={[styles.moodLabel, { color: theme.colors.text }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Ionicons name="document-text" size={28} color={theme.colors.info} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {stats.testsCompleted}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Тестов пройдено
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Сон')}
          >
            <Ionicons name="moon" size={28} color={theme.colors.purple} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {stats.avgSleepHours} ч
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Сон в среднем
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: theme.colors.card }]}
            onPress={() => navigation.navigate('Journal')}
          >
            <Ionicons name="happy" size={28} color={theme.colors.orange} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {stats.moodScore}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Настроение
            </Text>
          </TouchableOpacity>
        </View>

        {/* Быстрые действия */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Быстрые действия</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Тесты')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Пройти тест</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Journal')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="book" size={24} color={theme.colors.info} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Дневник</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Psychologist')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.purple + '20' }]}>
                <Ionicons name="people" size={24} color={theme.colors.purple} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Психолог</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Scan')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.orange + '20' }]}>
                <Ionicons name="qr-code" size={24} color={theme.colors.orange} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Сканер</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Рекомендация дня */}
        <View style={[styles.card, styles.recommendationCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="bulb" size={24} color={theme.colors.warning} />
            <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
              Рекомендация дня
            </Text>
          </View>
          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
            Сделайте 5 глубоких вдохов. Это поможет снизить уровень стресса и улучшить концентрацию.
          </Text>
        </View>

        {/* Мотивация */}
        <View style={[styles.quoteCard, { backgroundColor: theme.colors.info + '20' }]}>
          <Text style={[styles.quoteText, { color: theme.colors.text }]}>
            "Забота о себе — это не эгоизм, а необходимость."
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.colors.textSecondary }]}>
            — RiskDetect
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}