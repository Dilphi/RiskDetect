// Просмотр отдельной записи дневника
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/JournalEntryStyles'

export default function JournalEntryScreen({ route, navigation }) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', mood: 3 });

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
    { value: 1, label: 'Очень плохо', emoji: '😢', color: '#e74c3c' },
    { value: 2, label: 'Плохо', emoji: '😔', color: '#e67e22' },
    { value: 3, label: 'Нормально', emoji: '😐', color: '#f39c12' },
    { value: 4, label: 'Хорошо', emoji: '🙂', color: '#27ae60' },
    { value: 5, label: 'Отлично', emoji: '😊', color: '#2ecc71' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Запись не найдена</Text>
      </View>
    );
  }

  const mood = moodOptions.find(m => m.value === entry.mood);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Настроение */}
        <View style={[styles.moodCard, { backgroundColor: mood.color + '20' }]}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <View style={styles.moodInfo}>
            <Text style={styles.moodLabel}>{mood.label}</Text>
            <Text style={styles.moodDate}>
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
        <Text style={styles.entryTitle}>{entry.title}</Text>

        {/* Содержание */}
        <View style={styles.contentCard}>
          <Text style={styles.entryContent}>{entry.content}</Text>
        </View>

        {/* Теги (если есть) */}
        {entry.tags && entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Мета-информация */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Ionicons name="time" size={16} color="#7f8c8d" />
            <Text style={styles.metaText}>
              Создано: {new Date(entry.date).toLocaleString('ru-RU')}
            </Text>
          </View>
          {entry.editedAt && (
            <View style={styles.metaRow}>
              <Ionicons name="create" size={16} color="#7f8c8d" />
              <Text style={styles.metaText}>
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактировать запись</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.modalLabel}>Заголовок</Text>
              <TextInput
                style={styles.titleInput}
                value={editForm.title}
                onChangeText={(text) => setEditForm({...editForm, title: text})}
                placeholder="Введите заголовок"
              />

              <Text style={styles.modalLabel}>Настроение</Text>
              <View style={styles.moodSelector}>
                {moodOptions.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.moodOption,
                      editForm.mood === m.value && styles.moodOptionSelected,
                      { borderColor: m.color }
                    ]}
                    onPress={() => setEditForm({...editForm, mood: m.value})}
                  >
                    <Text style={styles.moodOptionEmoji}>{m.emoji}</Text>
                    <Text style={styles.moodOptionLabel}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Содержание</Text>
              <TextInput
                style={styles.contentInput}
                value={editForm.content}
                onChangeText={(text) => setEditForm({...editForm, content: text})}
                placeholder="Введите текст записи"
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
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveEdit}
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