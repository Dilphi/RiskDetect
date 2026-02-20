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
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/SleepStyles';

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
    { value: 1, label: 'Очень плохо', emoji: '😢', color: theme.colors.error },
    { value: 2, label: 'Плохо', emoji: '😔', color: theme.colors.warning },
    { value: 3, label: 'Нормально', emoji: '😐', color: theme.colors.warning },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: theme.colors.success },
    { value: 5, label: 'Отлично', emoji: '😊', color: theme.colors.success },
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
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
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
        Alert.alert('Ошибка', 'Пользователь не авторизован');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить пользователя');
      setLoading(false);
    }
  };

  const loadSleepData = async (userId) => {
    try {
      const data = await AsyncStorage.getItem(`sleep_${userId}`);
      const parsedData = data ? JSON.parse(data) : [];
      const sortedData = parsedData.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setSleepData(sortedData);
    } catch (error) {
      console.error('Error loading sleep data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные сна');
    } finally {
      setLoading(false);
    }
  };

  // Расчет часов сна 
  const calculateSleepHours = () => {
    let diffMs = wakeTime - bedTime;
    
    // Если время пробуждения меньше времени отхода ко сну,
    // значит сон перешел на следующий день
    if (diffMs < 0) {
      // Добавляем 24 часа в миллисекундах
      diffMs += 24 * 60 * 60 * 1000;
    }
    
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 10) / 10;
  };

  // Сохранение записи
  const saveSleepRecord = async () => {
    const hours = calculateSleepHours();
    
    if (!validateDate()) return;

    const userId = currentUser?.id || userData?.id;
    if (!userId) {
      Alert.alert('Ошибка', 'Пользователь не идентифицирован');
      return;
    }

    setSaving(true);

    try {
      const newRecord = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        bedTime: bedTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        hours: hours,
        quality: quality,
        notes: notes.trim() || '',
        qualityLabel: qualityOptions.find(q => q.value === quality)?.label,
        qualityEmoji: qualityOptions.find(q => q.value === quality)?.emoji,
        qualityColor: qualityOptions.find(q => q.value === quality)?.color,
        createdAt: new Date().toISOString()
      };

      const updatedData = [newRecord, ...sleepData];
      await AsyncStorage.setItem(`sleep_${userId}`, JSON.stringify(updatedData));
      setSleepData(updatedData);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Успешно', `Запись сна добавлена (${hours} часов)`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
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
      'Удаление записи',
      'Вы уверены, что хотите удалить эту запись?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = currentUser?.id || userData?.id;
              if (!userId) throw new Error('No user ID');
              
              const updatedData = sleepData.filter(record => record.id !== id);
              await AsyncStorage.setItem(`sleep_${userId}`, JSON.stringify(updatedData));
              setSleepData(updatedData);
              Alert.alert('Успешно', 'Запись удалена');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Ошибка', 'Не удалось удалить запись');
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
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
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
            Загрузка данных...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>😴 Мониторинг сна</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Отслеживайте качество вашего сна
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
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>📊 Статистика сна</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{getAverageSleep()} ч</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>В среднем</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{getAverageQuality().toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Качество</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBlock}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{sleepData.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Записей</Text>
            </View>
          </View>
        </View>

        {/* Рекомендация */}
        {sleepData.length > 0 && (
          <View style={[styles.recommendationCard, { backgroundColor: theme.colors.warning + '20' }]}>
            <Ionicons name="bulb" size={24} color={theme.colors.warning} />
            <View style={styles.recommendationText}>
              <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                {getAverageSleep() < 7 
                  ? '😴 Вам нужно больше спать' 
                  : getAverageSleep() > 9 
                  ? '⏰ Возможно, вы слишком много спите' 
                  : '✨ Отличный режим сна!'}
              </Text>
              <Text style={[styles.recommendationDescription, { color: theme.colors.textSecondary }]}>
                {getAverageSleep() < 7 
                  ? 'Рекомендуется спать 7-9 часов для хорошего самочувствия' 
                  : getAverageSleep() > 9 
                  ? 'Попробуйте ложиться спать позже или просыпаться раньше' 
                  : 'Продолжайте поддерживать здоровый режим сна'}
              </Text>
            </View>
          </View>
        )}

        {/* Последние записи */}
        <View style={[styles.historyCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.historyTitle, { color: theme.colors.text }]}>📝 Последние записи</Text>
          
          {sleepData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="moon" size={64} color={theme.colors.lightGray} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>Нет записей о сне</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                Добавьте первую запись, нажав на кнопку +
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
                        <Text style={[styles.historyHoursText, { color: theme.colors.text }]}>{record.hours} ч</Text>
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

        {/* Советы для хорошего сна */}
        <View style={[styles.tipsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>💡 Советы для хорошего сна</Text>
          
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Ложитесь спать в одно и то же время
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Не используйте телефон за час до сна
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Проветривайте комнату перед сном
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Не пейте кофе после 18:00
            </Text>
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
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>➕ Добавить запись сна</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Дата */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>📅 Дата</Text>
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
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>⏰ Время отхода ко сну</Text>
              <TouchableOpacity 
                style={[styles.timeButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowBedTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={theme.colors.info} />
                <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
                  {bedTime.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
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
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>⏰ Время пробуждения</Text>
              <TouchableOpacity 
                style={[styles.timeButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowWakeTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={theme.colors.info} />
                <Text style={[styles.timeButtonText, { color: theme.colors.text }]}>
                  {wakeTime.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
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
                Продолжительность: {calculateSleepHours()} часов
              </Text>

              {/* Качество сна */}
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Качество сна</Text>
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
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>📝 Заметки</Text>
              <TextInput
                style={[styles.notesInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder="Что вам снилось? Как вы себя чувствуете?"
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
                  Отмена
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
                    Сохранить
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