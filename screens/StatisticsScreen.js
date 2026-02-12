import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/StatisticsStyles'

export default function StatisticsScreen({ navigation, userData }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tests: [],
    sleep: [],
    mood: [],
    journal: []
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [testsData, sleepData, moodData, journalData] = await Promise.all([
        AsyncStorage.getItem(`tests_${userData?.id}`),
        AsyncStorage.getItem(`sleep_${userData?.id}`),
        AsyncStorage.getItem(`mood_${userData?.id}`),
        AsyncStorage.getItem(`journal_${userData?.id}`)
      ]);

      setStats({
        tests: testsData ? JSON.parse(testsData) : [],
        sleep: sleepData ? JSON.parse(sleepData) : [],
        mood: moodData ? JSON.parse(moodData) : [],
        journal: journalData ? JSON.parse(journalData) : []
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageSleep = () => {
    if (stats.sleep.length === 0) return 0;
    const total = stats.sleep.reduce((sum, record) => sum + record.hours, 0);
    return Math.round((total / stats.sleep.length) * 10) / 10;
  };

  const calculateAverageMood = () => {
    if (stats.mood.length === 0) return 0;
    const total = stats.mood.reduce((sum, entry) => sum + entry.value, 0);
    return Math.round((total / stats.mood.length) * 10) / 10;
  };

  const calculateTestStats = () => {
    if (stats.tests.length === 0) return { avg: 0, best: 0, worst: 100 };
    
    const scores = stats.tests.map(t => t.percentage);
    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      best: Math.max(...scores),
      worst: Math.min(...scores)
    };
  };

  const getMoodDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.mood.forEach(entry => {
      distribution[entry.value] = (distribution[entry.value] || 0) + 1;
    });
    return distribution;
  };

  const getWeeklyActivity = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const activity = new Array(7).fill(0);
    
    [...stats.sleep, ...stats.mood, ...stats.journal].forEach(item => {
      const day = new Date(item.date || item.createdAt || Date.now()).getDay();
      activity[day]++;
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
  const moodDistribution = getMoodDistribution();
  const weeklyActivity = getWeeklyActivity();
  const maxActivity = Math.max(...weeklyActivity.map(d => d.count));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Статистика</Text>
          <TouchableOpacity onPress={loadAllData}>
            <Ionicons name="refresh" size={24} color="#2ecc71" />
          </TouchableOpacity>
        </View>

        {/* Общая статистика */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Общая активность</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.tests.length}</Text>
              <Text style={styles.summaryLabel}>Тестов</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.sleep.length}</Text>
              <Text style={styles.summaryLabel}>Записей сна</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.mood.length}</Text>
              <Text style={styles.summaryLabel}>Отметок настроения</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.journal.length}</Text>
              <Text style={styles.summaryLabel}>Записей в дневнике</Text>
            </View>
          </View>
        </View>

        {/* Сон */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={24} color="#9b59b6" />
            <Text style={styles.cardTitle}>Сон</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Средняя продолжительность:</Text>
              <Text style={styles.statValue}>{calculateAverageSleep()} ч</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Всего часов сна:</Text>
              <Text style={styles.statValue}>
                {stats.sleep.reduce((sum, r) => sum + r.hours, 0)} ч
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Рекорд:</Text>
              <Text style={styles.statValue}>
                {Math.max(...stats.sleep.map(r => r.hours), 0)} ч
              </Text>
            </View>
          </View>
        </View>

        {/* Тесты */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#3498db" />
            <Text style={styles.cardTitle}>Тесты</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Средний результат:</Text>
              <Text style={styles.statValue}>{testStats.avg}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Лучший результат:</Text>
              <Text style={styles.statValue}>{testStats.best}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Худший результат:</Text>
              <Text style={styles.statValue}>{testStats.worst}%</Text>
            </View>
          </View>
        </View>

        {/* Настроение */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="happy" size={24} color="#e67e22" />
            <Text style={styles.cardTitle}>Настроение</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Средняя оценка:</Text>
              <Text style={styles.statValue}>{calculateAverageMood()}/5</Text>
            </View>
            
            <View style={styles.moodChart}>
              {[5,4,3,2,1].map(value => {
                const count = moodDistribution[value];
                const total = stats.mood.length;
                const percentage = total > 0 ? (count / total * 100) : 0;
                
                return (
                  <View key={value} style={styles.moodBarRow}>
                    <Text style={styles.moodBarLabel}>{value}</Text>
                    <View style={styles.moodBarContainer}>
                      <View 
                        style={[
                          styles.moodBar,
                          { 
                            width: `${percentage}%`,
                            backgroundColor: 
                              value === 5 ? '#2ecc71' :
                              value === 4 ? '#27ae60' :
                              value === 3 ? '#f39c12' :
                              value === 2 ? '#e67e22' : '#e74c3c'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.moodBarCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Активность по дням недели */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color="#1abc9c" />
            <Text style={styles.cardTitle}>Активность по дням</Text>
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
                          height: maxActivity > 0 
                            ? (day.count / maxActivity) * 100 
                            : 0,
                          backgroundColor: '#2ecc71'
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
          <Text style={styles.progressTitle}>Ваш прогресс</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Ionicons name="calendar" size={20} color="#3498db" />
              <Text style={styles.progressLabel}>
                {Math.max(
                  stats.tests.length,
                  stats.sleep.length,
                  stats.mood.length,
                  stats.journal.length
                )} дней активности
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Ionicons name="trophy" size={20} color="#f39c12" />
              <Text style={styles.progressLabel}>
                {stats.tests.length + stats.sleep.length + stats.mood.length + stats.journal.length} действий
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Ionicons name="heart" size={20} color="#e74c3c" />
              <Text style={styles.progressLabel}>
                {stats.tests.filter(t => t.percentage >= 70).length} успешных тестов
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

