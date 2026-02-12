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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/ProfileStyles'

export default function ProfileScreen({ navigation, userData, onLogout }) {
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    occupation: ''
  });

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
      
      // Обновляем в списке пользователей
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
      Alert.alert('Успешно', 'Профиль обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены? Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Удаляем пользователя
              const usersJson = await AsyncStorage.getItem('users');
              if (usersJson) {
                const users = JSON.parse(usersJson);
                const filteredUsers = users.filter(u => u.id !== user.id);
                await AsyncStorage.setItem('users', JSON.stringify(filteredUsers));
              }
              
              // Удаляем данные пользователя
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
              Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Профиль</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#2ecc71" />
          </TouchableOpacity>
        </View>

        {/* Аватар и основная информация */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'П'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name || 'Пользователь'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Ionicons name="calendar" size={16} color="#3498db" />
              <Text style={styles.badgeText}>
                С {new Date(user.registrationDate).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            {user.age && (
              <View style={styles.badge}>
                <Ionicons name="person" size={16} color="#e67e22" />
                <Text style={styles.badgeText}>{user.age} лет</Text>
              </View>
            )}
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#3498db20' }]}>
                <Ionicons name="document-text" size={24} color="#3498db" />
              </View>
              <View>
                <Text style={styles.statValue}>{user.tests?.length || 0}</Text>
                <Text style={styles.statLabel}>Тестов</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#9b59b620' }]}>
                <Ionicons name="moon" size={24} color="#9b59b6" />
              </View>
              <View>
                <Text style={styles.statValue}>{user.sleepData?.length || 0}</Text>
                <Text style={styles.statLabel}>Записей сна</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#e67e2220' }]}>
                <Ionicons name="happy" size={24} color="#e67e22" />
              </View>
              <View>
                <Text style={styles.statValue}>{user.moodEntries?.length || 0}</Text>
                <Text style={styles.statLabel}>Настроений</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Настройки */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#3498db" />
              <Text style={styles.settingLabel}>Уведомления</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#2ecc71' }}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color="#9b59b6" />
              <Text style={styles.settingLabel}>Тёмная тема</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#2ecc71' }}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={24} color="#2c3e50" />
              <Text style={styles.settingLabel}>Конфиденциальность</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color="#f39c12" />
              <Text style={styles.settingLabel}>Помощь и поддержка</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color="#3498db" />
              <Text style={styles.settingLabel}>О приложении</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
          </TouchableOpacity>
        </View>

        {/* Действия с аккаунтом */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
            <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выход из системы</Text>
            <Text style={styles.modalText}>
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.editModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактировать профиль</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Имя и фамилия</Text>
              <TextInput
                style={styles.editInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder="Введите имя"
              />

              <Text style={styles.editLabel}>Возраст</Text>
              <TextInput
                style={styles.editInput}
                value={editForm.age}
                onChangeText={(text) => setEditForm({...editForm, age: text})}
                placeholder="Введите возраст"
                keyboardType="numeric"
                maxLength={3}
              />

              <Text style={styles.editLabel}>Род деятельности</Text>
              <TextInput
                style={styles.editInput}
                value={editForm.occupation}
                onChangeText={(text) => setEditForm({...editForm, occupation: text})}
                placeholder="Например: студент, учитель, врач"
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