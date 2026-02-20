// Просмотр отдельной записи дневника
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
import * as NavigationBar from 'expo-navigation-bar'; 

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/JournalEntryStyles';

export default function JournalEntryScreen({ route, navigation }) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', mood: 3 });
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

  useEffect(() => {
    loadEntry();
  }, []);

  const loadEntry = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(userJson);
      const journalJson = await AsyncStorage.getItem(`journal_${userData.id}`);
      const journal = journalJson ? JSON.parse(journalJson) : [];
      const foundEntry = journal.find(e => e.id === entryId);
      
      if (foundEntry) {
        setEntry(foundEntry);
        setEditForm({
          title: foundEntry.title,
          content: foundEntry.content,
          mood: foundEntry.mood
        });
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      const userData = JSON.parse(userJson);
      const journalJson = await AsyncStorage.getItem(`journal_${userData.id}`);
      let journal = journalJson ? JSON.parse(journalJson) : [];
      
      const index = journal.findIndex(e => e.id === entryId);
      if (index !== -1) {
        journal[index] = {
          ...journal[index],
          title: editForm.title,
          content: editForm.content,
          mood: editForm.mood,
          editedAt: new Date().toISOString()
        };
        
        await AsyncStorage.setItem(`journal_${userData.id}`, JSON.stringify(journal));
        setEntry(journal[index]);
        setShowEditModal(false);
        Alert.alert('Успешно', 'Запись обновлена');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить запись');
    }
  };

  const handleDelete = () => {
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
              const userJson = await AsyncStorage.getItem('currentUser');
              const userData = JSON.parse(userJson);
              const journalJson = await AsyncStorage.getItem(`journal_${userData.id}`);
              let journal = journalJson ? JSON.parse(journalJson) : [];
              
              journal = journal.filter(e => e.id !== entryId);
              await AsyncStorage.setItem(`journal_${userData.id}`, JSON.stringify(journal));
              
              Alert.alert('Успешно', 'Запись удалена');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить запись');
            }
          }
        }
      ]
    );
  };

  const moodOptions = [
    { value: 1, label: 'Очень плохо', emoji: '😢', color: theme.colors.error },
    { value: 2, label: 'Плохо', emoji: '😔', color: theme.colors.warning },
    { value: 3, label: 'Нормально', emoji: '😐', color: theme.colors.warning },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: theme.colors.success },
    { value: 5, label: 'Отлично', emoji: '😊', color: theme.colors.success },
  ];

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Загрузка записи...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!entry) {
    return (
      <ScreenWrapper>
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Запись не найдена
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.errorButtonText, { color: theme.colors.white }]}>
              Вернуться
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const mood = moodOptions.find(m => m.value === entry.mood);

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color={theme.colors.info} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Настроение */}
        <View style={[styles.moodCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.moodIconContainer, { backgroundColor: mood.color + '20' }]}>
            <Text style={[styles.moodEmoji, { color: mood.color }]}>{mood.emoji}</Text>
          </View>
          <View style={styles.moodInfo}>
            <Text style={[styles.moodLabel, { color: theme.colors.text }]}>{mood.label}</Text>
            <Text style={[styles.moodDate, { color: theme.colors.textSecondary }]}>
              {new Date(entry.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Заголовок записи */}
        <Text style={[styles.entryTitle, { color: theme.colors.text }]}>{entry.title}</Text>

        {/* Содержание */}
        <View style={[styles.contentCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.entryContent, { color: theme.colors.text }]}>
            {entry.content}
          </Text>
        </View>

        {/* Теги (если есть) */}
        {entry.tags && entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Мета-информация */}
        <View style={[styles.metaCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.metaRow}>
            <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              Создано: {new Date(entry.date).toLocaleString('ru-RU')}
            </Text>
          </View>
          {entry.editedAt && (
            <View style={styles.metaRow}>
              <Ionicons name="create" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                Изменено: {new Date(entry.editedAt).toLocaleString('ru-RU')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Модальное окно редактирования */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Редактировать запись
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
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
                value={editForm.title}
                onChangeText={(text) => setEditForm({...editForm, title: text})}
                placeholder="Введите заголовок"
                placeholderTextColor={theme.colors.lightGray}
              />

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Настроение</Text>
              <View style={styles.moodSelector}>
                {moodOptions.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.moodOption,
                      editForm.mood === m.value && styles.moodOptionSelected,
                      { 
                        borderColor: m.color,
                        backgroundColor: editForm.mood === m.value ? m.color + '20' : theme.colors.background
                      }
                    ]}
                    onPress={() => setEditForm({...editForm, mood: m.value})}
                  >
                    <Text style={styles.moodOptionEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodOptionLabel, { color: theme.colors.text }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Содержание</Text>
              <TextInput
                style={[styles.contentInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.content}
                onChangeText={(text) => setEditForm({...editForm, content: text})}
                placeholder="Введите текст записи"
                placeholderTextColor={theme.colors.lightGray}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={saveEdit}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  Сохранить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}