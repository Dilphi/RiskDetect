import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/StatisticsStyles';

export default function StatisticsScreen({ navigation, userData }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(userData);
  const [stats, setStats] = useState({
    tests: [],
    sleep: [],
    mood: [],
    journal: []
  });

  // Инициализация
  useEffect(() => {
    initializeStats();
  }, []);

  const initializeStats = async () => {
    try {
      if (userData?.id) {
        setCurrentUser(userData);
        await loadAllData(userData.id);
      } else {
        const userJson = await AsyncStorage.getItem('currentUser');
        if (userJson) {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
          await loadAllData(user.id);
        } else {
          Alert.alert('❌ Ошибка', 'Пользователь не авторизован');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error initializing:', error);
      setLoading(false);
    }
  };

  // Загрузка всех данных
  const loadAllData = async (userId) => {
    try {
      // Загружаем тесты
      const testsJson = await AsyncStorage.getItem(`tests_${userId}`);
      const testsData = testsJson ? JSON.parse(testsJson) : [];
      
      // Загружаем сон
      const sleepJson = await AsyncStorage.getItem(`sleep_${userId}`);
      const sleepData = sleepJson ? JSON.parse(sleepJson) : [];
      
      // Загружаем настроение
      const moodJson = await AsyncStorage.getItem(`mood_${userId}`);
      const moodData = moodJson ? JSON.parse(moodJson) : [];
      
      // Загружаем дневник
      const journalJson = await AsyncStorage.getItem(`journal_${userId}`);
      const journalData = journalJson ? JSON.parse(journalJson) : [];

      console.log('📊 Загруженные данные:', {
        tests: testsData.length,
        sleep: sleepData.length,
        mood: moodData.length,
        journal: journalData.length
      });

      setStats({
        tests: testsData,
        sleep: sleepData,
        mood: moodData,
        journal: journalData
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert('❌ Ошибка', 'Не удалось загрузить статистику');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Обновление данных
  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentUser?.id) {
      await loadAllData(currentUser.id);
    }
    setRefreshing(false);
  };

  // ============= ТЕСТЫ =============
  const calculateTestStats = () => {
    if (stats.tests.length === 0) {
      return { 
        avg: 0, 
        best: 0, 
        worst: 0,
        count: 0,
        highScores: 0 
      };
    }
    
    const scores = stats.tests.map(t => t.percentage || 0);
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      best: Math.max(...scores),
      worst: Math.min(...scores),
      count: stats.tests.length,
      highScores: stats.tests.filter(t => (t.percentage || 0) >= 70).length
    };
  };

  // ============= СОН =============
  const calculateSleepStats = () => {
    if (stats.sleep.length === 0) {
      return { 
        avg: 0, 
        total: 0, 
        max: 0,
        count: 0,
        avgQuality: 0 
      };
    }
    
    const total = stats.sleep.reduce((sum, r) => sum + (r.hours || 0), 0);
    const avg = total / stats.sleep.length;
    const max = Math.max(...stats.sleep.map(r => r.hours || 0));
    const avgQuality = stats.sleep.reduce((sum, r) => sum + (r.quality || 0), 0) / stats.sleep.length;
    
    return {
      avg: Math.round(avg * 10) / 10,
      total: Math.round(total * 10) / 10,
      max: Math.round(max * 10) / 10,
      count: stats.sleep.length,
      avgQuality: Math.round(avgQuality * 10) / 10
    };
  };

  // ============= НАСТРОЕНИЕ =============
  const calculateMoodStats = () => {
    if (stats.mood.length === 0) {
      return { 
        avg: 0, 
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
      };
    }
    
    const avg = stats.mood.reduce((sum, entry) => sum + (entry.value || 0), 0) / stats.mood.length;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.mood.forEach(entry => {
      const val = entry.value || 3;
      distribution[val] = (distribution[val] || 0) + 1;
    });
    
    return {
      avg: Math.round(avg * 10) / 10,
      count: stats.mood.length,
      distribution
    };
  };

  // ============= ДНЕВНИК =============
  const calculateJournalStats = () => {
    return {
      count: stats.journal.length,
      lastEntry: stats.journal.length > 0 
        ? new Date(stats.journal[0].date).toLocaleDateString('ru-RU')
        : 'Нет записей'
    };
  };

  // ============= АКТИВНОСТЬ =============
  const getWeeklyActivity = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const activity = new Array(7).fill(0);
    
    const allItems = [
      ...stats.tests.map(t => ({ date: t.date })),
      ...stats.sleep.map(s => ({ date: s.date })),
      ...stats.mood.map(m => ({ date: m.date })),
      ...stats.journal.map(j => ({ date: j.date }))
    ];
    
    allItems.forEach(item => {
      if (item.date) {
        const day = new Date(item.date).getDay();
        activity[day]++;
      }
    });
    
    return days.map((day, index) => ({
      day,
      count: activity[index]
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Загрузка статистики...</Text>
      </View>
    );
  }

  const testStats = calculateTestStats();
  const sleepStats = calculateSleepStats();
  const moodStats = calculateMoodStats();
  const journalStats = calculateJournalStats();
  const weeklyActivity = getWeeklyActivity();
  const maxActivity = Math.max(...weeklyActivity.map(d => d.count), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Статистика</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="#2ecc71" />
          </TouchableOpacity>
        </View>

        {/* Общая активность */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📈 Общая активность</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{testStats.count}</Text>
              <Text style={styles.summaryLabel}>Тестов</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sleepStats.count}</Text>
              <Text style={styles.summaryLabel}>Записей сна</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{moodStats.count}</Text>
              <Text style={styles.summaryLabel}>Отметок настроения</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{journalStats.count}</Text>
              <Text style={styles.summaryLabel}>Записей в дневнике</Text>
            </View>
          </View>
        </View>

        {/* Секция тестов */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#3498db" />
            <Text style={styles.cardTitle}>📝 Тесты</Text>
          </View>
          <View style={styles.cardContent}>
            {testStats.count === 0 ? (
              <Text style={styles.emptyText}>Нет пройденных тестов</Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Пройдено тестов:</Text>
                  <Text style={styles.statValue}>{testStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Средний результат:</Text>
                  <Text style={styles.statValue}>{testStats.avg}%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Лучший результат:</Text>
                  <Text style={[styles.statValue, { color: '#2ecc71' }]}>
                    {testStats.best}%
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Худший результат:</Text>
                  <Text style={[styles.statValue, { color: '#e74c3c' }]}>
                    {testStats.worst}%
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Успешных тестов:</Text>
                  <Text style={styles.statValue}>{testStats.highScores}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Секция сна */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={24} color="#9b59b6" />
            <Text style={styles.cardTitle}>😴 Сон</Text>
          </View>
          <View style={styles.cardContent}>
            {sleepStats.count === 0 ? (
              <Text style={styles.emptyText}>Нет записей о сне</Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Всего записей:</Text>
                  <Text style={styles.statValue}>{sleepStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Средняя продолжительность:</Text>
                  <Text style={styles.statValue}>{sleepStats.avg} ч</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Всего часов сна:</Text>
                  <Text style={styles.statValue}>{sleepStats.total} ч</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Рекорд:</Text>
                  <Text style={[styles.statValue, { color: '#2ecc71' }]}>
                    {sleepStats.max} ч
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Качество сна:</Text>
                  <Text style={styles.statValue}>{sleepStats.avgQuality}/5</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Секция настроения */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="happy" size={24} color="#e67e22" />
            <Text style={styles.cardTitle}>😊 Настроение</Text>
          </View>
          <View style={styles.cardContent}>
            {moodStats.count === 0 ? (
              <Text style={styles.emptyText}>Нет отметок настроения</Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Всего отметок:</Text>
                  <Text style={styles.statValue}>{moodStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Средняя оценка:</Text>
                  <Text style={styles.statValue}>{moodStats.avg}/5</Text>
                </View>
                
                <View style={styles.moodChart}>
                  {[
                    { value: 5, emoji: '😊', label: 'Отлично' },
                    { value: 4, emoji: '🙂', label: 'Хорошо' },
                    { value: 3, emoji: '😐', label: 'Нормально' },
                    { value: 2, emoji: '😔', label: 'Плохо' },
                    { value: 1, emoji: '😢', label: 'Очень плохо' }
                  ].map((item) => {
                    const count = moodStats.distribution[item.value] || 0;
                    const total = moodStats.count;
                    const percentage = total > 0 ? (count / total * 100) : 0;
                    const colors = {
                      5: '#2ecc71', 4: '#27ae60', 3: '#f39c12', 2: '#e67e22', 1: '#e74c3c'
                    };
                    
                    return (
                      <View key={item.value} style={styles.moodBarRow}>
                        <Text style={styles.moodBarLabel}>
                          {item.emoji} {item.label}
                        </Text>
                        <View style={styles.moodBarContainer}>
                          <View 
                            style={[
                              styles.moodBar,
                              { 
                                width: `${percentage}%`,
                                backgroundColor: colors[item.value]
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.moodBarCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Секция дневника */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color="#1abc9c" />
            <Text style={styles.cardTitle}>📔 Дневник</Text>
          </View>
          <View style={styles.cardContent}>
            {journalStats.count === 0 ? (
              <Text style={styles.emptyText}>Нет записей в дневнике</Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Всего записей:</Text>
                  <Text style={styles.statValue}>{journalStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Последняя запись:</Text>
                  <Text style={styles.statValue}>{journalStats.lastEntry}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Активность по дням */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#e74c3c" />
            <Text style={styles.cardTitle}>📅 Активность по дням</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.weekChart}>
              {weeklyActivity.map((day, index) => (
                <View key={index} style={styles.weekColumn}>
                  <Text style={styles.weekDay}>{day.day}</Text>
                  <View style={styles.weekBarContainer}>
                    <View 
                      style={[
                        styles.weekBar,
                        { 
                          height: (day.count / maxActivity) * 80,
                          backgroundColor: day.count > 0 ? '#2ecc71' : '#ecf0f1'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.weekCount}>{day.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Прогресс */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>🏆 Ваш прогресс</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Ionicons name="flame" size={20} color="#e67e22" />
              <Text style={styles.progressLabel}>
                {testStats.count + sleepStats.count + moodStats.count + journalStats.count} действий
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Ionicons name="trophy" size={20} color="#f39c12" />
              <Text style={styles.progressLabel}>
                {testStats.highScores} успешных тестов
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Ionicons name="heart" size={20} color="#e74c3c" />
              <Text style={styles.progressLabel}>
                {moodStats.avg > 0 ? `${moodStats.avg}/5 среднее настроение` : 'Нет данных'}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}