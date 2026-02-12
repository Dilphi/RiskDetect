import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/JournalStyles'

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

  const moodOptions = [
    { value: 1, label: 'Очень плохо', emoji: '😢', color: '#e74c3c' },
    { value: 2, label: 'Плохо', emoji: '😔', color: '#e67e22' },
    { value: 3, label: 'Нормально', emoji: '😐', color: '#f39c12' },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: '#27ae60' },
    { value: 5, label: 'Отлично', emoji: '😊', color: '#2ecc71' },
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
    return mood?.color || '#95a5a6';
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Загрузка дневника...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Дневник</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Статистика настроения */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Ваше настроение</Text>
          <View style={styles.moodStats}>
            {[5,4,3,2,1].map(value => {
              const count = entries.filter(e => e.mood === value).length;
              const percentage = entries.length > 0 ? (count / entries.length * 100) : 0;
              const mood = moodOptions.find(m => m.value === value);
              
              return (
                <View key={value} style={styles.moodStat}>
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <View style={styles.moodBarContainer}>
                    <View 
                      style={[
                        styles.moodBar,
                        { width: `${percentage}%`, backgroundColor: mood.color }
                      ]} 
                    />
                  </View>
                  <Text style={styles.moodPercentage}>{Math.round(percentage)}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Записи */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Мои записи</Text>
          
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyStateText}>В дневнике пока нет записей</Text>
              <Text style={styles.emptyStateSubtext}>
                Начните вести дневник, чтобы отслеживать свои мысли и чувства
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyStateButtonText}>Создать первую запись</Text>
              </TouchableOpacity>
            </View>
          ) : (
            entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => setSelectedEntry(entry)}
              >
                <View style={styles.entryHeader}>
                  <View style={[styles.entryMood, { backgroundColor: entry.moodColor + '20' }]}>
                    <Text style={styles.entryMoodEmoji}>{entry.moodEmoji}</Text>
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.entryPreview} numberOfLines={2}>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новая запись</Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.modalLabel}>Заголовок</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="О чем вы думаете?"
                placeholderTextColor="#95a5a6"
                value={newEntry.title}
                onChangeText={(text) => setNewEntry({...newEntry, title: text})}
              />

              <Text style={styles.modalLabel}>Ваше настроение</Text>
              <View style={styles.moodSelector}>
                {moodOptions.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodOption,
                      newEntry.mood === mood.value && styles.moodOptionSelected,
                      { borderColor: mood.color }
                    ]}
                    onPress={() => setNewEntry({...newEntry, mood: mood.value})}
                  >
                    <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodOptionLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Запись</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Напишите свои мысли, чувства, переживания..."
                placeholderTextColor="#95a5a6"
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
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveEntry}
              >
                <Text style={styles.modalButtonSaveText}>Сохранить</Text>
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
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.viewModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedEntry?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <View style={styles.viewEntryMeta}>
              <View style={[styles.viewEntryMood, { backgroundColor: selectedEntry?.moodColor + '20' }]}>
                <Text style={styles.viewEntryMoodEmoji}>{selectedEntry?.moodEmoji}</Text>
                <Text style={[styles.viewEntryMoodLabel, { color: selectedEntry?.moodColor }]}>
                  {selectedEntry?.moodLabel}
                </Text>
              </View>
              <Text style={styles.viewEntryDate}>
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
              <Text style={styles.viewEntryText}>{selectedEntry?.content}</Text>
            </ScrollView>

            <View style={styles.viewEntryActions}>
              <TouchableOpacity 
                style={[styles.viewEntryButton, styles.viewEntryButtonDelete]}
                onPress={() => {
                  deleteEntry(selectedEntry.id);
                  setSelectedEntry(null);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                <Text style={styles.viewEntryButtonDeleteText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}