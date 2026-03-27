import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext'; 
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
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
  const { theme } = useTheme();
  const { t } = useTranslation();

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
          Alert.alert(t('common.error'), t('statistics.user_not_authorized'));
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error initializing:', error);
      setLoading(false);
    }
  };

  const loadAllData = async (userId) => {
    try {
      const testsJson = await AsyncStorage.getItem(`tests_${userId}`);
      const testsData = testsJson ? JSON.parse(testsJson) : [];
      
      const sleepJson = await AsyncStorage.getItem(`sleep_${userId}`);
      const sleepData = sleepJson ? JSON.parse(sleepJson) : [];
      
      const moodJson = await AsyncStorage.getItem(`mood_${userId}`);
      const moodData = moodJson ? JSON.parse(moodJson) : [];
      
      const journalJson = await AsyncStorage.getItem(`journal_${userId}`);
      const journalData = journalJson ? JSON.parse(journalJson) : [];

      setStats({
        tests: testsData,
        sleep: sleepData,
        mood: moodData,
        journal: journalData
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      Alert.alert(t('common.error'), t('statistics.load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (currentUser?.id) {
      await loadAllData(currentUser.id);
    }
    setRefreshing(false);
  };

  const calculateTestStats = () => {
    if (stats.tests.length === 0) {
      return { avg: 0, best: 0, worst: 0, count: 0, highScores: 0 };
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

  const calculateSleepStats = () => {
    if (stats.sleep.length === 0) {
      return { avg: 0, total: 0, max: 0, count: 0, avgQuality: 0 };
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

  const calculateMoodStats = () => {
    if (stats.mood.length === 0) {
      return { avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
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

  const calculateJournalStats = () => {
    return {
      count: stats.journal.length,
      lastEntry: stats.journal.length > 0 
        ? new Date(stats.journal[0].date).toLocaleDateString('ru-RU')
        : t('statistics.no_data')
    };
  };

  const getWeeklyActivity = () => {
    const days = [t('statistics.sun'), t('statistics.mon'), t('statistics.tue'), t('statistics.wed'), t('statistics.thu'), t('statistics.fri'), t('statistics.sat')];
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
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('statistics.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const testStats = calculateTestStats();
  const sleepStats = calculateSleepStats();
  const moodStats = calculateMoodStats();
  const journalStats = calculateJournalStats();
  const weeklyActivity = getWeeklyActivity();
  const maxActivity = Math.max(...weeklyActivity.map(d => d.count), 1);

  return (
    <ScreenWrapper>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Переключатель языка */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <LanguageSwitcher />
        </View>

        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('statistics.title')}</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Общая активность */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>{t('statistics.overall_activity')}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{testStats.count}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{t('statistics.tests_section')}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{sleepStats.count}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{t('statistics.sleep_section')}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{moodStats.count}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{t('statistics.mood_section')}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{journalStats.count}</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{t('statistics.journal_section')}</Text>
            </View>
          </View>
        </View>

        {/* Секция тестов */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={theme.colors.info} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('statistics.tests_section')}</Text>
          </View>
          <View style={styles.cardContent}>
            {testStats.count === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('statistics.no_tests')}
              </Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.tests_taken')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{testStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.average_result')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{testStats.avg}%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.best_result')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>{testStats.best}%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.worst_result')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.error }]}>{testStats.worst}%</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.successful_tests_count')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{testStats.highScores}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Секция сна */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="moon" size={24} color={theme.colors.purple} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('statistics.sleep_section')}</Text>
          </View>
          <View style={styles.cardContent}>
            {sleepStats.count === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('statistics.no_sleep')}
              </Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.total_records')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{sleepStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.average_duration')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{sleepStats.avg} {t('statistics.hours_short')}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.total_hours')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{sleepStats.total} {t('statistics.hours_short')}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.record')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.success }]}>{sleepStats.max} {t('statistics.hours_short')}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.sleep_quality')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{sleepStats.avgQuality}/5</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Секция настроения */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="happy" size={24} color={theme.colors.orange} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('statistics.mood_section')}</Text>
          </View>
          <View style={styles.cardContent}>
            {moodStats.count === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('statistics.no_mood')}
              </Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.total_entries')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{moodStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.average_rating')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{moodStats.avg}/5</Text>
                </View>
                
                <View style={styles.moodChart}>
                  {[
                    { value: 5, emoji: '😊', label: t('home.excellent'), color: theme.colors.success },
                    { value: 4, emoji: '🙂', label: t('home.good'), color: theme.colors.success },
                    { value: 3, emoji: '😐', label: t('home.normal'), color: theme.colors.warning },
                    { value: 2, emoji: '😔', label: t('home.bad'), color: theme.colors.warning },
                    { value: 1, emoji: '😢', label: t('home.very_bad'), color: theme.colors.error }
                  ].map((item) => {
                    const count = moodStats.distribution[item.value] || 0;
                    const total = moodStats.count;
                    const percentage = total > 0 ? (count / total * 100) : 0;
                    
                    return (
                      <View key={item.value} style={styles.moodBarRow}>
                        <Text style={[styles.moodBarLabel, { color: theme.colors.text }]}>
                          {item.emoji} {item.label}
                        </Text>
                        <View style={[styles.moodBarContainer, { backgroundColor: theme.colors.border }]}>
                          <View 
                            style={[
                              styles.moodBar,
                              { 
                                width: `${percentage}%`,
                                backgroundColor: item.color
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[styles.moodBarCount, { color: theme.colors.textSecondary }]}>
                          {count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Секция дневника */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color={theme.colors.success} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('statistics.journal_section')}</Text>
          </View>
          <View style={styles.cardContent}>
            {journalStats.count === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('statistics.no_journal')}
              </Text>
            ) : (
              <>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.total_entries')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{journalStats.count}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('statistics.last_entry')}:</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{journalStats.lastEntry}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Активность по дням */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color={theme.colors.error} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('statistics.weekly_activity')}</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.weekChart}>
              {weeklyActivity.map((day, index) => (
                <View key={index} style={styles.weekColumn}>
                  <Text style={[styles.weekDay, { color: theme.colors.textSecondary }]}>{day.day}</Text>
                  <View style={[styles.weekBarContainer, { backgroundColor: theme.colors.border }]}>
                    <View 
                      style={[
                        styles.weekBar,
                        { 
                          height: (day.count / maxActivity) * 80,
                          backgroundColor: day.count > 0 ? theme.colors.primary : theme.colors.border
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.weekCount, { color: theme.colors.text }]}>{day.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Прогресс */}
        <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>{t('statistics.your_progress')}</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Ionicons name="flame" size={20} color={theme.colors.orange} />
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                {testStats.count + sleepStats.count + moodStats.count + journalStats.count} {t('statistics.actions')}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Ionicons name="trophy" size={20} color={theme.colors.warning} />
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                {testStats.highScores} {t('statistics.successful_tests')}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Ionicons name="heart" size={20} color={theme.colors.error} />
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                {moodStats.avg > 0 ? `${moodStats.avg}/5 ${t('statistics.average_mood')}` : t('statistics.no_data')}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}