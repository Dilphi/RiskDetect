import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from '../styles/ProfileStyles';

export default function SleepScreen({ userData }) {
  const [sleepData, setSleepData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bedTime, setBedTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');

  const qualityOptions = [
    { value: 1, label: 'Очень плохо', emoji: '😢', color: '#e74c3c' },
    { value: 2, label: 'Плохо', emoji: '😔', color: '#e67e22' },
    { value: 3, label: 'Нормально', emoji: '😐', color: '#f39c12' },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: '#27ae60' },
    { value: 5, label: 'Отлично', emoji: '😊', color: '#2ecc71' },
  ];

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    try {
      const data = await AsyncStorage.getItem(`sleep_${userData?.id}`);
      setSleepData(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSleepHours = () => {
    const diffMs = wakeTime - bedTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    return Math.round(diffHrs * 10) / 10;
  };

  const saveSleepRecord = async () => {
    const hours = calculateSleepHours();
    
    if (hours < 0) {
      Alert.alert('Ошибка', 'Время пробуждения должно быть позже времени отхода ко сну');
      return;
    }

    const newRecord = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      bedTime: bedTime.toISOString(),
      wakeTime: wakeTime.toISOString(),
      hours: hours,
      quality: quality,
      notes: notes,
      qualityLabel: qualityOptions.find(q => q.value === quality)?.label
    };

    try {
      const updatedData = [...sleepData, newRecord];
      await AsyncStorage.setItem(`sleep_${userData?.id}`, JSON.stringify(updatedData));
      setSleepData(updatedData);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Успешно', 'Запись сна добавлена');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
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
              const updatedData = sleepData.filter(record => record.id !== id);
              await AsyncStorage.setItem(`sleep_${userData?.id}`, JSON.stringify(updatedData));
              setSleepData(updatedData);
            } catch (error) {
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

  const getLast7Days = () => {
    const last7 = sleepData
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);
    return last7;
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
        <View style={styles.header}>
          <Text style={styles.title}>Мониторинг сна</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Статистика */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Статистика сна</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{getAverageSleep()} ч</Text>
              <Text style={styles.statLabel}>В среднем</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{getAverageQuality()}</Text>
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
        <View style={styles.recommendationCard}>
          <Ionicons name="bulb" size={24} color="#f39c12" />
          <View style={styles.recommendationText}>
            <Text style={styles.recommendationTitle}>
              {getAverageSleep() < 7 
                ? 'Вам нужно больше спать' 
                : getAverageSleep() > 9 
                ? 'Возможно, вы слишком много спите' 
                : 'Отличный режим сна!'}
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

        {/* Последние записи */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Последние записи</Text>
          
          {getLast7Days().map((record) => {
            const qualityOption = qualityOptions.find(q => q.value === record.quality);
            const date = new Date(record.date).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short'
            });
            
            return (
              <View key={record.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <View style={styles.historyDate}>
                    <Text style={styles.historyDay}>{date}</Text>
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
          })}

          {sleepData.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="moon" size={48} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>Нет записей о сне</Text>
              <Text style={styles.emptyStateSubtext}>
                Добавьте первую запись, нажав на кнопку +
              </Text>
            </View>
          )}
        </View>

        {/* Советы для хорошего сна */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Советы для хорошего сна</Text>
          
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
              <Text style={styles.modalTitle}>Добавить запись сна</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Дата */}
              <Text style={styles.modalLabel}>Дата</Text>
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
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}

              {/* Время сна */}
              <Text style={styles.modalLabel}>Время отхода ко сну</Text>
              <DateTimePicker
                value={bedTime}
                mode="time"
                display="spinner"
                onChange={(event, time) => {
                  if (time) setBedTime(time);
                }}
              />

              <Text style={styles.modalLabel}>Время пробуждения</Text>
              <DateTimePicker
                value={wakeTime}
                mode="time"
                display="spinner"
                onChange={(event, time) => {
                  if (time) setWakeTime(time);
                }}
              />

              <Text style={styles.hoursPreview}>
                Продолжительность: {calculateSleepHours()} часов
              </Text>

              {/* Качество сна */}
              <Text style={styles.modalLabel}>Качество сна</Text>
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
              <Text style={styles.modalLabel}>Заметки (необязательно)</Text>
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
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveSleepRecord}
              >
                <Text style={styles.modalButtonSaveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

