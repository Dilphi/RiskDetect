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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  const qualityOptions = [
    { value: 1, label: 'Очень плохо', emoji: '😢', color: '#e74c3c' },
    { value: 2, label: 'Плохо', emoji: '😔', color: '#e67e22' },
    { value: 3, label: 'Нормально', emoji: '😐', color: '#f39c12' },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: '#27ae60' },
    { value: 5, label: 'Отлично', emoji: '😊', color: '#2ecc71' },
  ];

  // ✅ ИСПРАВЛЕНО: Инициализация с правильными вызовами
  useEffect(() => {
    initializeApp();
  }, []);

  // ✅ Функция инициализации
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
      Alert.alert('❌ Ошибка', 'Не удалось загрузить данные');
      setLoading(false);
    }
  };

  // ✅ Загрузка текущего пользователя
  const loadCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        await loadSleepData(user.id);
      } else {
        Alert.alert('❌ Ошибка', 'Пользователь не авторизован');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('❌ Ошибка', 'Не удалось загрузить пользователя');
      setLoading(false);
    }
  };

  // ✅ Загрузка данных сна
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
      Alert.alert('❌ Ошибка', 'Не удалось загрузить данные сна');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Расчет часов сна
  const calculateSleepHours = () => {
    const diffMs = wakeTime - bedTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 10) / 10;
  };

  // ✅ Валидация даты
  const validateDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    if (selected > today) {
      Alert.alert('⚠️ Ошибка', 'Дата не может быть в будущем');
      return false;
    }
    return true;
  };

  // ✅ Сохранение записи
  const saveSleepRecord = async () => {
    const hours = calculateSleepHours();
    
    if (hours < 0) {
      Alert.alert('⚠️ Ошибка', 'Время пробуждения должно быть позже времени отхода ко сну');
      return;
    }

    if (!validateDate()) return;

    const userId = currentUser?.id || userData?.id;
    if (!userId) {
      Alert.alert('❌ Ошибка', 'Пользователь не идентифицирован');
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
      Alert.alert('✅ Успешно', 'Запись сна добавлена');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('❌ Ошибка', 'Не удалось сохранить запись');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Сброс формы
  const resetForm = () => {
    setSelectedDate(new Date());
    setBedTime(new Date());
    setWakeTime(new Date());
    setQuality(3);
    setNotes('');
  };

  // ✅ Удаление записи
  const deleteSleepRecord = (id) => {
    Alert.alert(
      '🗑️ Удаление записи',
      'Вы уверены, что хотите удалить эту запись?',
      [
        { text: '❌ Отмена', style: 'cancel' },
        {
          text: '✅ Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = currentUser?.id || userData?.id;
              if (!userId) throw new Error('No user ID');
              
              const updatedData = sleepData.filter(record => record.id !== id);
              await AsyncStorage.setItem(`sleep_${userId}`, JSON.stringify(updatedData));
              setSleepData(updatedData);
              Alert.alert('✅ Успешно', 'Запись удалена');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('❌ Ошибка', 'Не удалось удалить запись');
            }
          }
        }
      ]
    );
  };

  // ✅ Статистика
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

  // ✅ Форматирование даты
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>😴 Мониторинг сна</Text>
            <Text style={styles.subtitle}>
              Отслеживайте качество вашего сна
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Статистика */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Статистика сна</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{getAverageSleep()} ч</Text>
              <Text style={styles.statLabel}>В среднем</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{getAverageQuality().toFixed(1)}</Text>
              <Text style={styles.statLabel}>Качество</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{sleepData.length}</Text>
              <Text style={styles.statLabel}>Записей</Text>
            </View>
          </View>
        </View>

        {/* Рекомендация */}
        {sleepData.length > 0 && (
          <View style={styles.recommendationCard}>
            <Ionicons name="bulb" size={24} color="#f39c12" />
            <View style={styles.recommendationText}>
              <Text style={styles.recommendationTitle}>
                {getAverageSleep() < 7 
                  ? '😴 Вам нужно больше спать' 
                  : getAverageSleep() > 9 
                  ? '⏰ Возможно, вы слишком много спите' 
                  : '✨ Отличный режим сна!'}
              </Text>
              <Text style={styles.recommendationDescription}>
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
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>📝 Последние записи</Text>
          
          {sleepData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="moon" size={64} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>Нет записей о сне</Text>
              <Text style={styles.emptyStateSubtext}>
                Добавьте первую запись, нажав на кнопку +
              </Text>
            </View>
          ) : (
            sleepData.slice(0, 7).map((record) => {
              const qualityOption = qualityOptions.find(q => q.value === record.quality);
              return (
                <View key={record.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <View style={styles.historyDate}>
                      <Text style={styles.historyDay}>{formatDate(record.date)}</Text>
                    </View>
                    
                    <View style={styles.historyStats}>
                      <View style={styles.historyHours}>
                        <Ionicons name="moon" size={16} color="#2ecc71" />
                        <Text style={styles.historyHoursText}>{record.hours} ч</Text>
                      </View>
                      
                      <View style={[styles.qualityBadge, { backgroundColor: qualityOption.color + '20' }]}>
                        <Text style={[styles.qualityBadgeText, { color: qualityOption.color }]}>
                          {qualityOption.emoji} {qualityOption.label}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => deleteSleepRecord(record.id)}>
                      <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                  
                  {record.notes ? (
                    <Text style={styles.historyNotes}>{record.notes}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        {/* Советы для хорошего сна */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Советы для хорошего сна</Text>
          
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            <Text style={styles.tipText}>Ложитесь спать в одно и то же время</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            <Text style={styles.tipText}>Не используйте телефон за час до сна</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            <Text style={styles.tipText}>Проветривайте комнату перед сном</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            <Text style={styles.tipText}>Не пейте кофе после 18:00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Модальное окно добавления записи */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ Добавить запись сна</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Дата */}
              <Text style={styles.modalLabel}>📅 Дата</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#3498db" />
                <Text style={styles.dateButtonText}>
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
              <Text style={styles.modalLabel}>⏰ Время отхода ко сну</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowBedTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#3498db" />
                <Text style={styles.timeButtonText}>
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
              <Text style={styles.modalLabel}>⏰ Время пробуждения</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowWakeTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#3498db" />
                <Text style={styles.timeButtonText}>
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

              <Text style={styles.hoursPreview}>
                Продолжительность: {calculateSleepHours()} часов
              </Text>

              {/* Качество сна */}
              <Text style={styles.modalLabel}>⭐ Качество сна</Text>
              <View style={styles.qualityGrid}>
                {qualityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityOption,
                      quality === option.value && styles.qualityOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setQuality(option.value)}
                  >
                    <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                    <Text style={styles.qualityLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Заметки */}
              <Text style={styles.modalLabel}>📝 Заметки</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Что вам снилось? Как вы себя чувствуете?"
                placeholderTextColor="#95a5a6"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, saving && styles.buttonDisabled]}
                onPress={saveSleepRecord}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.modalButtonSaveText}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}