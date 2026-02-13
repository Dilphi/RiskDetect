import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../components/ThemeContext';
import { useNotifications } from '../components/NotificationContext';
import styles from '../styles/ProfileStyles';

export default function ProfileScreen({ navigation, userData, onLogout }) {
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    occupation: ''
  });

  // Используем контексты
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications, permissionStatus } = useNotifications();

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        age: user.age ? user.age.toString() : '',
        occupation: user.occupation || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    if (onLogout) {
      await onLogout();
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        name: editForm.name,
        age: editForm.age ? parseInt(editForm.age) : null,
        occupation: editForm.occupation
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      const usersJson = await AsyncStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          users[index] = updatedUser;
          await AsyncStorage.setItem('users', JSON.stringify(users));
        }
      }

      setUser(updatedUser);
      setShowEditModal(false);
      Alert.alert('✅ Успешно', 'Профиль обновлен');
    } catch (error) {
      Alert.alert('❌ Ошибка', 'Не удалось обновить профиль');
    }
  };

  const handleNotificationsToggle = async (value) => {
    if (value && permissionStatus !== 'granted') {
      Alert.alert(
        '📱 Разрешение на уведомления',
        'Для получения уведомлений необходимо разрешение. Хотите открыть настройки?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Разрешить', onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      await toggleNotifications(value);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '🗑️ Удаление аккаунта',
      'Вы уверены? Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.',
      [
        { text: '❌ Отмена', style: 'cancel' },
        { 
          text: '✅ Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              const usersJson = await AsyncStorage.getItem('users');
              if (usersJson) {
                const users = JSON.parse(usersJson);
                const filteredUsers = users.filter(u => u.id !== user.id);
                await AsyncStorage.setItem('users', JSON.stringify(filteredUsers));
              }
              
              await AsyncStorage.removeItem('currentUser');
              await AsyncStorage.removeItem('isAuthenticated');
              await AsyncStorage.removeItem(`tests_${user.id}`);
              await AsyncStorage.removeItem(`sleep_${user.id}`);
              await AsyncStorage.removeItem(`mood_${user.id}`);
              await AsyncStorage.removeItem(`journal_${user.id}`);
              
              if (onLogout) {
                await onLogout();
              }
            } catch (error) {
              Alert.alert('❌ Ошибка', 'Не удалось удалить аккаунт');
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Загрузка профиля...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Профиль</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Аватар и основная информация */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'П'}
              </Text>
            </View>
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.colors.secondary }]}>
              <Ionicons name="camera" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: theme.colors.text }]}>{user.name || 'Пользователь'}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user.email}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="calendar" size={16} color={theme.colors.secondary} />
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                С {new Date(user.registrationDate).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            {user.age && (
              <View style={[styles.badge, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="person" size={16} color={theme.colors.orange} />
                <Text style={[styles.badgeText, { color: theme.colors.text }]}>{user.age} лет</Text>
              </View>
            )}
          </View>
        </View>

        {/* Статистика */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Статистика</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Ionicons name="document-text" size={24} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.tests?.length || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Тестов</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.purple + '20' }]}>
                <Ionicons name="moon" size={24} color={theme.colors.purple} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.sleepData?.length || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Записей сна</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.orange + '20' }]}>
                <Ionicons name="happy" size={24} color={theme.colors.orange} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.moodEntries?.length || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Настроений</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Настройки */}
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Настройки</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.secondary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Уведомления</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color={theme.colors.purple} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Тёмная тема</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Конфиденциальность</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.warning} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Помощь и поддержка</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.secondary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>О приложении</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
        </View>

        {/* Действия с аккаунтом */}
        <View style={[styles.actionsCard, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.danger} />
            <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.lightGray }]}>
            RiskDetect • Версия 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Модальное окно выхода */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Выход из системы</Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              Вы уверены, что хотите выйти из аккаунта?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalButtonConfirmText}>Выйти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно редактирования профиля */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Редактировать профиль</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={[styles.editLabel, { color: theme.colors.text }]}>Имя и фамилия</Text>
              <TextInput
                style={[styles.editInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder="Введите имя"
                placeholderTextColor={theme.colors.lightGray}
              />

              <Text style={[styles.editLabel, { color: theme.colors.text }]}>Возраст</Text>
              <TextInput
                style={[styles.editInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.age}
                onChangeText={(text) => setEditForm({...editForm, age: text})}
                placeholder="Введите возраст"
                placeholderTextColor={theme.colors.lightGray}
                keyboardType="numeric"
                maxLength={3}
              />

              <Text style={[styles.editLabel, { color: theme.colors.text }]}>Род деятельности</Text>
              <TextInput
                style={[styles.editInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.occupation}
                onChangeText={(text) => setEditForm({...editForm, occupation: text})}
                placeholder="Например: студент, учитель, врач"
                placeholderTextColor={theme.colors.lightGray}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveProfile}
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