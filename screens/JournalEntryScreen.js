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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/JournalEntryStyles';
import api from '../services/api'

export default function JournalEntryScreen({ route, navigation }) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', mood: 3 });
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
    loadEntry();
  }, []);

  const loadEntry = async () => {
    try {
      const response = await api.getJournalEntry(entryId);
      if (response.success && response.entry) {
        setEntry(response.entry);
        setEditForm({
          title: response.entry.title,
          content: response.entry.content,
          mood: response.entry.mood
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
      await api.updateJournalEntry(entryId, {
        title: editForm.title,
        content: editForm.content,
        mood: editForm.mood
      });
      
      await loadEntry(); // Перезагружаем
      setShowEditModal(false);
      Alert.alert(t('common.success'), t('journal.entry_updated'));
    } catch (error) {
      Alert.alert(t('common.error'), t('journal.entry_update_error'));
    }
  };

  const handleDelete = () => {
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
              await api.deleteJournalEntry(entryId);
              Alert.alert(t('common.success'), t('journal.delete_success'));
              navigation.goBack();
            } catch (error) {
              Alert.alert(t('common.error'), t('journal.delete_error'));
            }
          }
        }
      ]
    );
  };

  const moodOptions = [
    { value: 1, label: t('journal.very_bad'), emoji: '😢', color: theme.colors.error },
    { value: 2, label: t('journal.bad'), emoji: '😔', color: theme.colors.warning },
    { value: 3, label: t('journal.normal'), emoji: '😐', color: theme.colors.warning },
    { value: 4, label: t('journal.good'), emoji: '🙂', color: theme.colors.success },
    { value: 5, label: t('journal.excellent'), emoji: '😊', color: theme.colors.success },
  ];

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

  if (!entry) {
    return (
      <ScreenWrapper>
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            {t('journal.not_found')}
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.errorButtonText, { color: theme.colors.white }]}>
              {t('journal.go_back')}
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
        {/* Переключатель языка */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <LanguageSwitcher />
        </View>

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

        {/* Мета-информация */}
        <View style={[styles.metaCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.metaRow}>
            <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {t('journal.created')}: {new Date(entry.date).toLocaleString('ru-RU')}
            </Text>
          </View>
          {entry.editedAt && (
            <View style={styles.metaRow}>
              <Ionicons name="create" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                {t('journal.edited')}: {new Date(entry.editedAt).toLocaleString('ru-RU')}
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
                {t('journal.edit_entry')}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
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
                value={editForm.title}
                onChangeText={(text) => setEditForm({...editForm, title: text})}
                placeholder={t('journal.title_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
              />

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('journal.mood_field')}</Text>
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

              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('journal.content_field')}</Text>
              <TextInput
                style={[styles.contentInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.content}
                onChangeText={(text) => setEditForm({...editForm, content: text})}
                placeholder={t('journal.content_placeholder')}
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
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={saveEdit}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}