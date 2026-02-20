import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/JournalStyles';

export default function JournalScreen({ navigation, userData }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 3,
    tags: []
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
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
    { value: 1, label: 'Очень плохо', emoji: '😢', color: theme.colors.error },
    { value: 2, label: 'Плохо', emoji: '😔', color: theme.colors.warning },
    { value: 3, label: 'Нормально', emoji: '😐', color: theme.colors.warning },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: theme.colors.success },
    { value: 5, label: 'Отлично', emoji: '😊', color: theme.colors.success },
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(`journal_${userData?.id}`);
      setEntries(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!newEntry.title.trim()) {
      Alert.alert('Ошибка', 'Введите заголовок записи');
      return;
    }

    if (!newEntry.content.trim()) {
      Alert.alert('Ошибка', 'Введите текст записи');
      return;
    }

    const entry = {
      id: Date.now().toString(),
      ...newEntry,
      date: new Date().toISOString(),
      moodEmoji: moodOptions.find(m => m.value === newEntry.mood)?.emoji,
      moodLabel: moodOptions.find(m => m.value === newEntry.mood)?.label,
      moodColor: moodOptions.find(m => m.value === newEntry.mood)?.color
    };

    try {
      const updatedEntries = [entry, ...entries];
      await AsyncStorage.setItem(`journal_${userData?.id}`, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setShowAddModal(false);
      resetForm();
      Alert.alert('Успешно', 'Запись добавлена в дневник');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
    }
  };

  const deleteEntry = (id) => {
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
              const updatedEntries = entries.filter(entry => entry.id !== id);
              await AsyncStorage.setItem(`journal_${userData?.id}`, JSON.stringify(updatedEntries));
              setEntries(updatedEntries);
              Alert.alert('Успешно', 'Запись удалена');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить запись');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNewEntry({
      title: '',
      content: '',
      mood: 3,
      tags: []
    });
  };

  const getMoodColor = (value) => {
    const mood = moodOptions.find(m => m.value === value);
    return mood?.color || theme.colors.lightGray;
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
        month: 'short',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Загрузка дневника...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Дневник</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Статистика настроения */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Ваше настроение</Text>
          <View style={styles.moodStats}>
            {[5,4,3,2,1].map(value => {
              const count = entries.filter(e => e.mood === value).length;
              const percentage = entries.length > 0 ? (count / entries.length * 100) : 0;
              const mood = moodOptions.find(m => m.value === value);
              
              return (
                <View key={value} style={styles.moodStat}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <View style={[styles.moodBarContainer, { backgroundColor: theme.colors.border }]}>
                    <View 
                      style={[
                        styles.moodBar,
                        { 
                          width: `${percentage}%`, 
                          backgroundColor: mood.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.moodPercentage, { color: theme.colors.textSecondary }]}>
                    {Math.round(percentage)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Записи */}
        <View style={styles.entriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Мои записи</Text>
          
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={theme.colors.lightGray} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
                В дневнике пока нет записей
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                Начните вести дневник, чтобы отслеживать свои мысли и чувства
              </Text>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={[styles.emptyStateButtonText, { color: theme.colors.white }]}>
                  Создать первую запись
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={[styles.entryCard, { backgroundColor: theme.colors.card }]}
                onPress={() => setSelectedEntry(entry)}
              >
                <View style={styles.entryHeader}>
                  <View style={[styles.entryMood, { backgroundColor: entry.moodColor + '20' }]}>
                    <Text style={styles.entryMoodEmoji}>{entry.moodEmoji}</Text>
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryTitle, { color: theme.colors.text }]}>
                      {entry.title}
                    </Text>
                    <Text style={[styles.entryDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(entry.date)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.entryPreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {entry.content}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Новая запись</Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <Ionicons name="close" size={24} color={theme.colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Заголовок</Text>
              <TextInput
                style={[styles.titleInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder="О чем вы думаете?"
                placeholderTextColor={theme.colors.lightGray}
                value={newEntry.title}
                onChangeText={(text) => setNewEntry({...newEntry, title: text})}
              />

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Ваше настроение</Text>
              <View style={styles.moodSelector}>
                {moodOptions.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodOption,
                      newEntry.mood === mood.value && styles.moodOptionSelected,
                      { 
                        borderColor: mood.color,
                        backgroundColor: newEntry.mood === mood.value ? mood.color + '20' : theme.colors.background
                      }
                    ]}
                    onPress={() => setNewEntry({...newEntry, mood: mood.value})}
                  >
                    <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodOptionLabel, { color: theme.colors.text }]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Запись</Text>
              <TextInput
                style={[styles.contentInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder="Напишите свои мысли, чувства, переживания..."
                placeholderTextColor={theme.colors.lightGray}
                value={newEntry.content}
                onChangeText={(text) => setNewEntry({...newEntry, content: text})}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={saveEntry}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  Сохранить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно просмотра записи */}
      <Modal
        visible={selectedEntry !== null}
        animationType="fade"
        transparent={true}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.viewModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedEntry?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                <Ionicons name="close" size={24} color={theme.colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.viewEntryMeta}>
              <View style={[styles.viewEntryMood, { backgroundColor: selectedEntry?.moodColor + '20' }]}>
                <Text style={styles.viewEntryMoodEmoji}>{selectedEntry?.moodEmoji}</Text>
                <Text style={[styles.viewEntryMoodLabel, { color: selectedEntry?.moodColor }]}>
                  {selectedEntry?.moodLabel}
                </Text>
              </View>
              <Text style={[styles.viewEntryDate, { color: theme.colors.textSecondary }]}>
                {selectedEntry && new Date(selectedEntry.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>

            <ScrollView style={styles.viewEntryContent}>
              <Text style={[styles.viewEntryText, { color: theme.colors.text }]}>
                {selectedEntry?.content}
              </Text>
            </ScrollView>

            <View style={styles.viewEntryActions}>
              <TouchableOpacity 
                style={[styles.viewEntryButton, styles.viewEntryButtonDelete]}
                onPress={() => {
                  deleteEntry(selectedEntry.id);
                  setSelectedEntry(null);
                }}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.viewEntryButtonDeleteText, { color: theme.colors.error }]}>
                  Удалить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}