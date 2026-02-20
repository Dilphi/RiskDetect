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
  Linking,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { useTheme } from '../components/ThemeContext';
import { useNotifications } from '../components/NotificationContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/ProfileStyles';

export default function ProfileScreen({ navigation, userData, onLogout }) {
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Состояния для модальных окон разделов
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    occupation: ''
  });
  
  // Состояние для аватара
  const [avatar, setAvatar] = useState(null);
  
  // Состояния для статистики
  const [stats, setStats] = useState({
    tests: 0,
    sleep: 0,
    mood: 0
  });

  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications, permissionStatus } = useNotifications();

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

  // Загружаем пользователя при монтировании
  useEffect(() => {
    loadUserData();
    loadAvatar();
  }, []);

  // Загружаем статистику при каждом фокусе на экране
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [user?.id, userData?.id])
  );

  // Загружаем пользователя
  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Загружаем аватар
  const loadAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  // Загружаем статистику из AsyncStorage
  const loadStats = async () => {
    try {
      const userId = user?.id || userData?.id;
      if (!userId) return;

      const testsJson = await AsyncStorage.getItem(`tests_${userId}`);
      const sleepJson = await AsyncStorage.getItem(`sleep_${userId}`);
      const moodJson = await AsyncStorage.getItem(`mood_${userId}`);
      
      setStats({
        tests: testsJson ? JSON.parse(testsJson).length : 0,
        sleep: sleepJson ? JSON.parse(sleepJson).length : 0,
        mood: moodJson ? JSON.parse(moodJson).length : 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Обновляем форму при изменении пользователя
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        age: user.age ? user.age.toString() : '',
        occupation: user.occupation || ''
      });
    }
  }, [user]);

  // Запрос разрешений для камеры и галереи
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Разрешения',
        'Для выбора фото необходимы разрешения на доступ к камере и галерее. Хотите открыть настройки?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Открыть настройки', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    return true;
  };

  // Выбор фото из галереи
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        processImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  // Сделать фото с камеры
  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        processImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  // Обработка и сохранение изображения
  const processImage = async (asset) => {
    try {
      // Оптимизируем изображение
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // Сохраняем base64 строку
      if (manipulatedImage.base64) {
        const avatarBase64 = `data:image/jpeg;base64,${manipulatedImage.base64}`;
        await AsyncStorage.setItem('userAvatar', avatarBase64);
        setAvatar(avatarBase64);
        setShowAvatarModal(false);
        Alert.alert('Успешно', 'Фото профиля обновлено');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обработать изображение');
    }
  };

  // Удалить аватар
  const removeAvatar = async () => {
    Alert.alert(
      'Удалить фото',
      'Вы уверены, что хотите удалить фото профиля?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userAvatar');
            setAvatar(null);
            setShowAvatarModal(false);
          }
        }
      ]
    );
  };

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
      Alert.alert('Успешно', 'Профиль обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
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
      'Удаление аккаунта',
      'Вы уверены? Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
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
              await AsyncStorage.removeItem('userAvatar');
              
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
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Загрузка профиля...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Профиль</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Аватар и основная информация */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
          >
            {avatar ? (
              <Image 
                source={{ uri: avatar }} 
                style={[styles.avatar, { width: 100, height: 100, borderRadius: 50 }]}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.avatarText, { color: theme.colors.white, fontSize: 40 }]}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'П'}
                </Text>
              </View>
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: theme.colors.secondary }]}>
              <Ionicons name="camera" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
          
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
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.tests}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Тестов</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.purple + '20' }]}>
                <Ionicons name="moon" size={24} color={theme.colors.purple} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.sleep}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Записей сна</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.orange + '20' }]}>
                <Ionicons name="happy" size={24} color={theme.colors.orange} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.mood}</Text>
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
          
          {/* Кнопка Конфиденциальность */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => setShowPrivacyModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Конфиденциальность</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
          
          {/* Кнопка Помощь и поддержка */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => setShowHelpModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.warning} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Помощь и поддержка</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
          
          {/* Кнопка О приложении */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => setShowAboutModal(true)}
          >
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
            <Text style={[styles.logoutButtonText, { color: theme.colors.danger }]}>Выйти из аккаунта</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
            <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>Удалить аккаунт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.lightGray }]}>
            RiskDetect • Версия 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* МОДАЛЬНОЕ ОКНО ВЫБОРА ФОТО */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="camera" size={24} color={theme.colors.primary} /> Фото профиля
              </Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Предпросмотр текущего фото */}
              {avatar && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Image 
                    source={{ uri: avatar }} 
                    style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
                  />
                </View>
              )}

              {/* Кнопки выбора */}
              <TouchableOpacity 
                style={[styles.avatarOption, { 
                  backgroundColor: theme.colors.background,
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center'
                }]}
                onPress={pickImageFromGallery}
              >
                <Ionicons name="images" size={24} color={theme.colors.primary} />
                <Text style={[styles.avatarOptionText, { color: theme.colors.text, marginLeft: 15, fontSize: 16 }]}>
                  Выбрать из галереи
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.avatarOption, { 
                  backgroundColor: theme.colors.background,
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center'
                }]}
                onPress={takePhotoWithCamera}
              >
                <Ionicons name="camera" size={24} color={theme.colors.primary} />
                <Text style={[styles.avatarOptionText, { color: theme.colors.text, marginLeft: 15, fontSize: 16 }]}>
                  Сделать фото
                </Text>
              </TouchableOpacity>

              {avatar && (
                <TouchableOpacity 
                  style={[styles.avatarOption, { 
                    backgroundColor: theme.colors.background,
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }]}
                  onPress={removeAvatar}
                >
                  <Ionicons name="trash" size={24} color={theme.colors.danger} />
                  <Text style={[styles.avatarOptionText, { color: theme.colors.danger, marginLeft: 15, fontSize: 16 }]}>
                    Удалить фото
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAvatarModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* МОДАЛЬНОЕ ОКНО КОНФИДЕНЦИАЛЬНОСТЬ */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="lock-closed" size={24} color={theme.colors.primary} /> Конфиденциальность
              </Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.modalBody}>
                <Text style={[styles.modalText, { color: theme.colors.text, fontSize: 16, marginBottom: 20 }]}>
                  🔐 Политика конфиденциальности
                </Text>
                
                <View style={[styles.privacySection, { marginBottom: 20 }]}>
                  <Text style={[styles.privacyTitle, { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }]}>
                    📊 Какие данные мы собираем:
                  </Text>
                  <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 }]}>
                    • Результаты психологических тестов{'\n'}
                    • Данные о сне (время, качество){'\n'}
                    • Записи в дневнике настроения{'\n'}
                    • Отметки настроения{'\n'}
                    • Email и имя пользователя
                  </Text>
                </View>

                <View style={[styles.privacySection, { marginBottom: 20 }]}>
                  <Text style={[styles.privacyTitle, { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }]}>
                    🔒 Как мы защищаем данные:
                  </Text>
                  <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 }]}>
                    • Все данные хранятся локально на вашем устройстве{'\n'}
                    • Никакие данные не передаются на сервер{'\n'}
                    • Полная анонимность{'\n'}
                    • Возможность полного удаления аккаунта
                  </Text>
                </View>

                <View style={[styles.privacySection, { marginBottom: 20 }]}>
                  <Text style={[styles.privacyTitle, { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }]}>
                    📝 Ваши права:
                  </Text>
                  <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 }]}>
                    • Вы можете в любой момент удалить свой аккаунт{'\n'}
                    • Все ваши данные будут безвозвратно удалены{'\n'}
                    • Вы можете экспортировать свои данные{'\n'}
                    • Мы не передаём данные третьим лицам
                  </Text>
                </View>

                <Text style={[styles.privacyDate, { color: theme.colors.lightGray, fontSize: 12, textAlign: 'center', marginTop: 20 }]}>
                  Последнее обновление: 20 февраля 2026
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  Понятно
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* МОДАЛЬНОЕ ОКНО ПОМОЩЬ И ПОДДЕРЖКА */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="help-circle" size={24} color={theme.colors.warning} /> Помощь и поддержка
              </Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.modalBody}>
                <Text style={[styles.modalText, { color: theme.colors.text, fontSize: 16, marginBottom: 20 }]}>
                  ❓ Часто задаваемые вопросы
                </Text>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    Как пройти тест?
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    1. Перейдите на вкладку "Тесты"{'\n'}
                    2. Выберите интересующий вас тест{'\n'}
                    3. Ответьте на все вопросы{'\n'}
                    4. Получите результат с рекомендациями
                  </Text>
                </View>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    Как вести дневник?
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    1. Перейдите на вкладку "Дневник"{'\n'}
                    2. Нажмите кнопку "+"{'\n'}
                    3. Напишите свои мысли и отметьте настроение{'\n'}
                    4. Сохраните запись
                  </Text>
                </View>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    Как отслеживать сон?
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    1. Перейдите на вкладку "Сон"{'\n'}
                    2. Нажмите кнопку "+"{'\n'}
                    3. Укажите время сна и его качество{'\n'}
                    4. Добавьте заметки (необязательно)
                  </Text>
                </View>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    Как получить экстренную помощь?
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    • Нажмите на красную иконку с восклицательным знаком на главном экране{'\n'}
                    • Перейдите на вкладку "Психолог"{'\n'}
                    • Используйте экстренные контакты в верхней части экрана
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.helpContactButton, { 
                    backgroundColor: theme.colors.primary,
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 10,
                    marginBottom: 10
                  }]}
                  onPress={() => {
                    setShowHelpModal(false);
                    navigation.navigate('Psychologist');
                  }}
                >
                  <Text style={[styles.helpContactButtonText, { color: theme.colors.white, fontSize: 16 }]}>
                    Связаться с психологом
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  Закрыть
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* МОДАЛЬНОЕ ОКНО О ПРИЛОЖЕНИИ */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="information-circle" size={24} color={theme.colors.secondary} /> О приложении
              </Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={[styles.aboutContainer, { alignItems: 'center', padding: 20 }]}>
                <View style={[styles.aboutIcon, { 
                  width: 100, 
                  height: 100, 
                  borderRadius: 20, 
                  backgroundColor: theme.colors.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20
                }]}>
                  <Ionicons name="heart" size={50} color={theme.colors.primary} />
                </View>

                <Text style={[styles.aboutTitle, { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }]}>
                  RiskDetect
                </Text>
                
                <Text style={[styles.aboutVersion, { color: theme.colors.secondary, fontSize: 16, marginBottom: 20 }]}>
                  Версия 1.0.0
                </Text>

                <Text style={[styles.aboutDescription, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 20 }]}>
                  RiskDetect — это приложение для мониторинга психологического состояния. Мы помогаем отслеживать настроение, качество сна, проходить психологические тесты и вести дневник эмоций.
                </Text>

                <View style={[styles.aboutSection, { width: '100%', marginBottom: 15 }]}>
                  <Text style={[styles.aboutSectionTitle, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    ✨ Возможности:
                  </Text>
                  <Text style={[styles.aboutSectionText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                    • Психологические тесты (депрессия, тревога, стресс){'\n'}
                    • Дневник настроения с эмоциями{'\n'}
                    • Мониторинг качества сна{'\n'}
                    • Статистика и аналитика{'\n'}
                    • Чат с психологом{'\n'}
                    • Экстренная помощь{'\n'}
                    • Тёмная тема
                  </Text>
                </View>

                <View style={[styles.aboutSection, { width: '100%', marginBottom: 15 }]}>
                  <Text style={[styles.aboutSectionTitle, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    👨‍💻 Разработчик:
                  </Text>
                  <Text style={[styles.aboutSectionText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                    • Разработано с ❤️ для заботы о психическом здоровье{'\n'}
                    • Все данные хранятся локально{'\n'}
                    • Полная конфиденциальность
                  </Text>
                </View>

                <View style={[styles.aboutSection, { width: '100%', marginBottom: 15 }]}>
                  <Text style={[styles.aboutSectionTitle, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    📧 Контакты:
                  </Text>
                  <Text style={[styles.aboutSectionText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                    support@riskdetect.app{'\n'}
                    www.riskdetect.app
                  </Text>
                </View>

                <Text style={[styles.aboutCopyright, { color: theme.colors.lightGray, fontSize: 12, marginTop: 20 }]}>
                  © 2026 RiskDetect. Все права защищены.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowAboutModal(false)}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  Закрыть
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.danger }]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalButtonConfirmText, { color: theme.colors.white }]}>
                  Выйти
                </Text>
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
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={saveProfile}
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