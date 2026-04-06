import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/SleepStyles';
import api from '../services/api'

export default function SleepScreen({ userData }) {
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [currentUser, setCurrentUser] = useState(userData);
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

  const qualityOptions = [
    { value: 1, label: t('sleep.very_bad'), emoji: '😢', color: theme.colors.error },
    { value: 2, label: t('sleep.bad'), emoji: '😔', color: theme.colors.warning },
    { value: 3, label: t('sleep.normal'), emoji: '😐', color: theme.colors.warning },
    { value: 4, label: t('sleep.good'), emoji: '🙂', color: theme.colors.success },
    { value: 5, label: t('sleep.excellent'), emoji: '😊', color: theme.colors.success },
  ];

  // Инициализация
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      if (userData?.id) {
        setCurrentUser(userData);
        await loadSleepData(userData.id);
      } else {
        await loadCurrentUser();
      }
    } catch (error) {
      console.error('Error initializing:', error);
      Alert.alert('❌ ' + t('common.error'), t('sleep.data_load_error'));
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        await loadSleepData(user.id);
      } else {
        Alert.alert('❌ ' + t('common.error'), t('sleep.user_not_authorized'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('❌ ' + t('common.error'), t('sleep.user_load_error'));
      setLoading(false);
    }
  };

  const loadSleepData = async () => {
    try {
      const response = await api.getSleepRecords();
      // Проверяем, что данные существуют и это массив
      if (response && response.records && Array.isArray(response.records)) {
        setSleepData(response.records);
      } else {
        setSleepData([]); // Пустой массив, если данных нет
      }
    } catch (error) {
      console.log('Нет данных сна или ошибка загрузки');
      setSleepData([]); // При ошибке тоже ставим пустой массив
    } finally {
      setLoading(false);
    }
  };

  // Расчет часов сна
  const calculateSleepHours = () => {
    let diffMs = wakeTime - bedTime;
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 10) / 10;
  };

  // Валидация даты
  const validateDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    if (selected > today) {
      Alert.alert('⚠️ ' + t('common.error'), t('sleep.date_future_error'));
      return false;
    }
    return true;
  };

  // Сохранение записи
  const saveSleepRecord = async () => {
    if (!validateDate()) return;

    const hours = calculateSleepHours();
    setSaving(true);

    try {
      await api.saveSleepRecord({
        date: selectedDate.toISOString(),
        bedTime: bedTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        hours: hours,
        quality: quality,
        notes: notes.trim() || ''
      });
      
      await loadSleepData(); // Перезагружаем данные
      setShowAddModal(false);
      resetForm();
      Alert.alert('✅ ' + t('common.success'), t('sleep.record_added', { hours: hours }));
    } catch (error) {
      Alert.alert('❌ ' + t('common.error'), t('sleep.record_save_error'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setBedTime(new Date());
    setWakeTime(new Date());
    setQuality(3);
    setNotes('');
  };

  const deleteSleepRecord = (id) => {
    Alert.alert(
      '🗑️ ' + t('sleep.delete_title'),
      t('sleep.delete_confirm'),
      [
        { text: '❌ ' + t('common.cancel'), style: 'cancel' },
        {
          text: '✅ ' + t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteSleepRecord(id);
              await loadSleepData();
              Alert.alert('✅ ' + t('common.success'), t('sleep.record_deleted'));
            } catch (error) {
              Alert.alert('❌ ' + t('common.error'), t('sleep.delete_error'));
            }
          }
        }
      ]
    );
  };

  const getAverageSleep = () => {
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, record) => sum + record.hours, 0);
    return Math.round((total / sleepData.length) * 10) / 10;
  };

  const getAverageQuality = () => {
    if (sleepData.length === 0) return 0;
    const total = sleepData.reduce((sum, record) => sum + record.quality, 0);
    return Math.round((total / sleepData.length) * 10) / 10;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('sleep.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('sleep.yesterday');
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const avgSleep = getAverageSleep();
  const avgQuality = getAverageQuality();

  let recommendationTitle = '';
  let recommendationDesc = '';
  if (avgSleep < 7) {
    recommendationTitle = t('sleep.need_more_sleep');
    recommendationDesc = t('sleep.rec_short');
  } else if (avgSleep > 9) {
    recommendationTitle = t('sleep.too_much_sleep');
    recommendationDesc = t('sleep.rec_long');
  } else {
    recommendationTitle = t('sleep.great_schedule');
    recommendationDesc = t('sleep.rec_good');
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Переключатель языка */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <LanguageSwitcher />
        </View>

        {/* Заголовок */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>😴 {t('sleep.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('sleep.subtitle')}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Статистика */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>📊 {t('sleep.statistics')}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{getAverageSleep()} {t('sleep.hours_short')}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('sleep.average')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{getAverageQuality().toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('sleep.quality')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{sleepData.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('sleep.records')}</Text>
            </View>
          </View>
        </View>

        {/* Рекомендация */}
        {sleepData.length > 0 && (
          <View style={[styles.recommendationCard, { backgroundColor: theme.colors.warning + '20' }]}>
            <Ionicons name="bulb" size={24} color={theme.colors.warning} />
            <View style={styles.recommendationText}>
              <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                {recommendationTitle}
              </Text>
              <Text style={[styles.recommendationDescription, { color: theme.colors.textSecondary }]}>
                {recommendationDesc}
              </Text>
            </View>
          </View>
        )}

        {/* Последние записи */}
        <View style={[styles.historyCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.historyTitle, { color: theme.colors.text }]}>📝 {t('sleep.recent_records')}</Text>
          
          {sleepData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="moon" size={64} color={theme.colors.lightGray} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>{t('sleep.no_records')}</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                {t('sleep.add_first')}
              </Text>
            </View>
          ) : (
            sleepData.slice(0, 7).map((record) => {
              const qualityOption = qualityOptions.find(q => q.value === record.quality);
              return (
                <View key={record.id} style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}>
                  <View style={styles.historyItemHeader}>
                    <View style={styles.historyDate}>
                      <Text style={[styles.historyDay, { color: theme.colors.text }]}>{formatDate(record.date)}</Text>
                    </View>
                    
                    <View style={styles.historyStats}>
                      <View style={styles.historyHours}>
                        <Ionicons name="moon" size={16} color={theme.colors.primary} />
                        <Text style={[styles.historyHoursText, { color: theme.colors.text }]}>{record.hours} {t('sleep.hours_short')}</Text>
                      </View>
                      
                      <View style={[styles.qualityBadge, { backgroundColor: qualityOption.color + '20' }]}>
                        <Text style={[styles.qualityBadgeText, { color: qualityOption.color }]}>
                          {qualityOption.emoji} {qualityOption.label}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => deleteSleepRecord(record.id)}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  {record.notes ? (
                    <Text style={[styles.historyNotes, { color: theme.colors.textSecondary }]}>{record.notes}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        {/* Советы */}
        <View style={[styles.tipsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>{t('sleep.tips_title')}</Text>
          
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{t('sleep.tip1')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{t('sleep.tip2')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{t('sleep.tip3')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{t('sleep.tip4')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Модальное окно добавления записи */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>➕ {t('sleep.add_record')}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Дата */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>📅 {t('sleep.date')}</Text>
              <TouchableOpacity 
                style={[styles.dateButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={theme.colors.info} />
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {selectedDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}

              {/* Время отхода ко сну */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>⏰ {t('sleep.bedtime')}</Text>
              <TouchableOpacity 
                style={[styles.timeButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowBedTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={theme.colors.info} />
                <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
                  {bedTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {showBedTimePicker && (
                <DateTimePicker
                  value={bedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowBedTimePicker(false);
                    if (selectedTime) setBedTime(selectedTime);
                  }}
                />
              )}

              {/* Время пробуждения */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>⏰ {t('sleep.wake_time')}</Text>
              <TouchableOpacity 
                style={[styles.timeButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowWakeTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={theme.colors.info} />
                <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
                  {wakeTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {showWakeTimePicker && (
                <DateTimePicker
                  value={wakeTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedTime) => {
                    setShowWakeTimePicker(false);
                    if (selectedTime) setWakeTime(selectedTime);
                  }}
                />
              )}

              <Text style={[styles.hoursPreview, { color: theme.colors.primary }]}>
                {t('sleep.duration')}: {calculateSleepHours()} {t('sleep.hours')}
              </Text>

              {/* Качество сна */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>⭐ {t('sleep.quality')}</Text>
              <View style={styles.qualityGrid}>
                {qualityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityOption,
                      quality === option.value && styles.qualityOptionSelected,
                      { 
                        borderColor: option.color,
                        backgroundColor: quality === option.value ? option.color + '20' : theme.colors.background
                      }
                    ]}
                    onPress={() => setQuality(option.value)}
                  >
                    <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                    <Text style={[styles.qualityLabel, { color: theme.colors.text }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Заметки */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>📝 {t('sleep.notes')}</Text>
              <TextInput
                style={[styles.notesInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder={t('sleep.notes_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.border }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.modalButtonSave, 
                  { backgroundColor: theme.colors.primary },
                  saving && styles.buttonDisabled
                ]}
                onPress={saveSleepRecord}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                  <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                    {t('common.save')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}