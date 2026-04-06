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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/ProfileStyles';
import api from '../services/api'

export default function ProfileScreen({ navigation, userData, onLogout }) {
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    occupation: ''
  });
  
  const [avatar, setAvatar] = useState(null);
  
  const [stats, setStats] = useState({
    tests: 0,
    sleep: 0,
    mood: 0
  });

  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications, permissionStatus } = useNotifications();
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
    loadUserData();
    loadAvatar();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [user?.id, userData?.id])
  );

  const loadUserData = async () => {
    try {
      const response = await api.getMe();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

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

  const loadStats = async () => {
    try {
      const [tests, sleep, mood] = await Promise.all([
        api.getTests().catch(() => ({ tests: [] })),
        api.getSleepRecords().catch(() => ({ records: [] })),
        api.getMoodEntries().catch(() => ({ entries: [] }))
      ]);
      
      setStats({
        tests: tests.tests?.length || 0,
        sleep: sleep.records?.length || 0,
        mood: mood.entries?.length || 0
      });
    } catch (error) {
      console.log('Нет статистики для нового пользователя');
      setStats({ tests: 0, sleep: 0, mood: 0 });
    }
  };
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        age: user.age ? user.age.toString() : '',
        occupation: user.occupation || ''
      });
    }
  }, [user]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        t('profile.permissions_title'),
        t('profile.permissions_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('profile.open_settings'), onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    return true;
  };

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
      Alert.alert(t('common.error'), t('profile.image_select_error'));
    }
  };

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
      Alert.alert(t('common.error'), t('profile.photo_take_error'));
    }
  };

  const processImage = async (asset) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (manipulatedImage.base64) {
        const avatarBase64 = `data:image/jpeg;base64,${manipulatedImage.base64}`;
        await AsyncStorage.setItem('userAvatar', avatarBase64);
        setAvatar(avatarBase64);
        setShowAvatarModal(false);
        Alert.alert(t('common.success'), t('profile.photo_updated'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.photo_update_error'));
    }
  };

  const removeAvatar = async () => {
    Alert.alert(
      t('profile.photo_delete_title'),
      t('profile.photo_delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
    await api.logout();
    if (onLogout) {
      await onLogout();
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const saveProfile = async () => {
  try {
    const response = await api.updateProfile({
      name: editForm.name,
      age: editForm.age ? parseInt(editForm.age) : null,
      occupation: editForm.occupation
    });
    
    if (response.success) {
      setUser(response.user);
      setShowEditModal(false);
      Alert.alert(t('common.success'), t('profile.profile_updated'));
    }
  } catch (error) {
    Alert.alert(t('common.error'), t('profile.profile_update_error'));
  }
};

  const handleNotificationsToggle = async (value) => {
    if (value && permissionStatus !== 'granted') {
      Alert.alert(
        t('profile.notifications_title'),
        t('profile.notifications_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('profile.allow'), onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      await toggleNotifications(value);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.delete_title'),
      t('profile.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
              await api.logout();
              if (onLogout) await onLogout();
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.delete_error'));
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
            {t('profile.loading')}
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

        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('profile.title')}</Text>
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
                  {user.name ? user.name.charAt(0).toUpperCase() : t('profile.user').charAt(0)}
                </Text>
              </View>
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: theme.colors.secondary }]}>
              <Ionicons name="camera" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.userName, { color: theme.colors.text }]}>{user.name || t('profile.user')}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user.email}</Text>
          
          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: theme.colors.background }]}>
              <Ionicons name="calendar" size={16} color={theme.colors.secondary} />
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                {t('profile.member_since', { date: new Date(user.registrationDate).toLocaleDateString('ru-RU') })}
              </Text>
            </View>
            {user.age && (
              <View style={[styles.badge, { backgroundColor: theme.colors.background }]}>
                <Ionicons name="person" size={16} color={theme.colors.orange} />
                <Text style={[styles.badgeText, { color: theme.colors.text }]}>{user.age} {t('profile.years_old')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Статистика */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.statistics')}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Ionicons name="document-text" size={24} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.tests}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('profile.tests')}</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.purple + '20' }]}>
                <Ionicons name="moon" size={24} color={theme.colors.purple} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.sleep}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('profile.sleep_records')}</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.orange + '20' }]}>
                <Ionicons name="happy" size={24} color={theme.colors.orange} />
              </View>
              <View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.mood}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('profile.mood_entries')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Настройки */}
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.settings')}</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.secondary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('profile.notifications')}</Text>
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
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('profile.dark_theme')}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => setShowPrivacyModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('profile.privacy')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => setShowHelpModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.warning} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('profile.help_support')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.lightGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => setShowAboutModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.secondary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{t('profile.about_app')}</Text>
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
            <Text style={[styles.logoutButtonText, { color: theme.colors.danger }]}>{t('profile.logout')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
            <Text style={[styles.deleteButtonText, { color: theme.colors.danger }]}>{t('profile.delete_account')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.lightGray }]}>
            {t('profile.version')}
          </Text>
        </View>
      </ScrollView>

      {/* Модальное окно выбора фото */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="camera" size={24} color={theme.colors.primary} /> {t('profile.profile_photo')}
              </Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {avatar && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Image 
                    source={{ uri: avatar }} 
                    style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
                  />
                </View>
              )}

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
                  {t('profile.choose_from_gallery')}
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
                  {t('profile.take_photo')}
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
                    {t('profile.delete_photo')}
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
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно конфиденциальность */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="lock-closed" size={24} color={theme.colors.primary} /> {t('profile.privacy')}
              </Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.modalBody}>
                <Text style={[styles.modalText, { color: theme.colors.text, fontSize: 16, marginBottom: 20 }]}>
                  🔐 {t('profile.privacy_policy')}
                </Text>
                
                <View style={[styles.privacySection, { marginBottom: 20 }]}>
                  <Text style={[styles.privacyTitle, { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }]}>
                    📊 {t('profile.data_collected')}
                  </Text>
                  <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 }]}>
                    {t('profile.data_collected_items').map(item => `• ${item}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.privacySection, { marginBottom: 20 }]}>
                  <Text style={[styles.privacyTitle, { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }]}>
                    🔒 {t('profile.data_protection')}
                  </Text>
                  <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 }]}>
                    {t('profile.data_protection_items').map(item => `• ${item}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.privacySection, { marginBottom: 20 }]}>
                  <Text style={[styles.privacyTitle, { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }]}>
                    📝 {t('profile.your_rights')}
                  </Text>
                  <Text style={[styles.privacyText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 }]}>
                    {t('profile.rights_items').map(item => `• ${item}`).join('\n')}
                  </Text>
                </View>

                <Text style={[styles.privacyDate, { color: theme.colors.lightGray, fontSize: 12, textAlign: 'center', marginTop: 20 }]}>
                  {t('profile.last_updated')}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  {t('profile.understand')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно помощь и поддержка */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="help-circle" size={24} color={theme.colors.warning} /> {t('profile.help_support')}
              </Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.modalBody}>
                <Text style={[styles.modalText, { color: theme.colors.text, fontSize: 16, marginBottom: 20 }]}>
                  ❓ {t('profile.faq')}
                </Text>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.how_take_test')}
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    {t('profile.how_take_test_steps').map((step, i) => `${i + 1}. ${step}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.how_keep_journal')}
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    {t('profile.how_keep_journal_steps').map((step, i) => `${i + 1}. ${step}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.how_track_sleep')}
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    {t('profile.how_track_sleep_steps').map((step, i) => `${i + 1}. ${step}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.helpSection, { marginBottom: 20 }]}>
                  <Text style={[styles.helpQuestion, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.how_get_emergency')}
                  </Text>
                  <Text style={[styles.helpAnswer, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 15 }]}>
                    {t('profile.how_get_emergency_steps').map(step => `• ${step}`).join('\n')}
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
                    {t('profile.contact_psychologist')}
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
                  {t('profile.close')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно о приложении */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, styles.editModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                <Ionicons name="information-circle" size={24} color={theme.colors.secondary} /> {t('profile.about_app')}
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
                  {t('common.app_name')}
                </Text>
                
                <Text style={[styles.aboutVersion, { color: theme.colors.secondary, fontSize: 16, marginBottom: 20 }]}>
                  {t('profile.version')}
                </Text>

                <Text style={[styles.aboutDescription, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 20 }]}>
                  {t('profile.about_description')}
                </Text>

                <View style={[styles.aboutSection, { width: '100%', marginBottom: 15 }]}>
                  <Text style={[styles.aboutSectionTitle, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.features_title')}
                  </Text>
                  <Text style={[styles.aboutSectionText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                    {t('profile.features').map(item => `• ${item}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.aboutSection, { width: '100%', marginBottom: 15 }]}>
                  <Text style={[styles.aboutSectionTitle, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.developer_title')}
                  </Text>
                  <Text style={[styles.aboutSectionText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                    {t('profile.developer_items').map(item => `• ${item}`).join('\n')}
                  </Text>
                </View>

                <View style={[styles.aboutSection, { width: '100%', marginBottom: 15 }]}>
                  <Text style={[styles.aboutSectionTitle, { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('profile.contacts_title')}
                  </Text>
                  <Text style={[styles.aboutSectionText, { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                    support@riskdetect.app{'\n'}
                    www.riskdetect.app
                  </Text>
                </View>

                <Text style={[styles.aboutCopyright, { color: theme.colors.lightGray, fontSize: 12, marginTop: 20 }]}>
                  {t('profile.copyright')}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowAboutModal(false)}
              >
                <Text style={[styles.modalButtonSaveText, { color: theme.colors.white }]}>
                  {t('profile.close')}
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
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('profile.logout_title')}</Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              {t('profile.logout_confirm')}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.danger }]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalButtonConfirmText, { color: theme.colors.white }]}>
                  {t('profile.logout')}
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
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('profile.edit_profile')}</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={[styles.editLabel, { color: theme.colors.text }]}>{t('profile.name')}</Text>
              <TextInput
                style={[styles.editInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.name}
                onChangeText={(text) => setEditForm({...editForm, name: text})}
                placeholder={t('profile.name_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
              />

              <Text style={[styles.editLabel, { color: theme.colors.text }]}>{t('profile.age')}</Text>
              <TextInput
                style={[styles.editInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.age}
                onChangeText={(text) => setEditForm({...editForm, age: text})}
                placeholder={t('profile.age_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
                keyboardType="numeric"
                maxLength={3}
              />

              <Text style={[styles.editLabel, { color: theme.colors.text }]}>{t('profile.occupation')}</Text>
              <TextInput
                style={[styles.editInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={editForm.occupation}
                onChangeText={(text) => setEditForm({...editForm, occupation: text})}
                placeholder={t('profile.occupation_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
              />
            </View>

            <View style={styles.modalButtons}>
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
                onPress={saveProfile}
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