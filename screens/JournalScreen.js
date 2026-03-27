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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
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

  const moodOptions = [
    { value: 1, label: t('journal.very_bad'), emoji: '😢', color: theme.colors.error },
    { value: 2, label: t('journal.bad'), emoji: '😔', color: theme.colors.warning },
    { value: 3, label: t('journal.normal'), emoji: '😐', color: theme.colors.warning },
    { value: 4, label: t('journal.good'), emoji: '🙂', color: theme.colors.success },
    { value: 5, label: t('journal.excellent'), emoji: '😊', color: theme.colors.success },
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
      Alert.alert(t('common.error'), t('journal.add_title_error'));
      return;
    }

    if (!newEntry.content.trim()) {
      Alert.alert(t('common.error'), t('journal.add_content_error'));
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
      Alert.alert(t('common.success'), t('journal.add_success'));
    } catch (error) {
      Alert.alert(t('common.error'), t('journal.add_error'));
    }
  };

  const deleteEntry = (id) => {
    Alert.alert(
      t('journal.delete_title'),
      t('journal.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(entry => entry.id !== id);
              await AsyncStorage.setItem(`journal_${userData?.id}`, JSON.stringify(updatedEntries));
              setEntries(updatedEntries);
              Alert.alert(t('common.success'), t('journal.delete_success'));
            } catch (error) {
              Alert.alert(t('common.error'), t('journal.delete_error'));
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('journal.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('journal.yesterday');
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
            {t('common.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Переключатель языка */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <LanguageSwitcher />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('journal.title')}</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Статистика настроения */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>{t('journal.your_mood')}</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('journal.my_entries')}</Text>
          
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={theme.colors.lightGray} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
                {t('journal.no_entries')}
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
                {t('journal.start_journaling')}
              </Text>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={[styles.emptyStateButtonText, { color: theme.colors.white }]}>
                  {t('journal.create_first')}
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
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('journal.new_entry')}</Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}>
                <Ionicons name="close" size={24} color={theme.colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('journal.title_field')}</Text>
              <TextInput
                style={[styles.titleInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder={t('journal.title_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
                value={newEntry.title}
                onChangeText={(text) => setNewEntry({...newEntry, title: text})}
              />

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('journal.mood_field')}</Text>
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

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('journal.entry_content')}</Text>
              <TextInput
                style={[styles.contentInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder={t('journal.write_thoughts')}
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
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={saveEntry}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  {t('common.save')}
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
                  {t('common.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}