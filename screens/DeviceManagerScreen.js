import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/DeviceManagerStyles';

export default function DeviceManagerScreen({ navigation, userData }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(userData); 
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

      return () => {
        NavigationBar.setVisibilityAsync('visible');
        NavigationBar.setButtonStyleAsync('dark');
      };
    }
  }, [theme.dark]);

  // Загрузка данных при монтировании
  useEffect(() => {
    if (userData?.id) {
      setCurrentUser(userData);
      loadDevices(userData.id);
    } else {
      loadCurrentUser();
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        await loadDevices(user.id);
      } else {
        setLoading(false);
        Alert.alert('Ошибка', 'Пользователь не авторизован');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setLoading(false);
    }
  };

  const loadDevices = async (userId) => {
    try {
      const devicesData = await AsyncStorage.getItem(`paired_devices_${userId}`);
      setDevices(devicesData ? JSON.parse(devicesData) : []);
    } catch (error) {
      console.error('Error loading devices:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить устройства');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Исправлено: безопасная загрузка userId
  const onRefresh = async () => {
    setRefreshing(true);
    const userId = userData?.id || currentUser?.id;
    if (userId) {
      await loadDevices(userId);
    } else {
      setRefreshing(false);
      Alert.alert('Ошибка', 'Пользователь не идентифицирован');
    }
  };

  const syncDevice = async (device) => {
    Alert.alert('Синхронизация', `Синхронизация с ${device.name}...`);
    setTimeout(() => {
      Alert.alert('Успешно', 'Данные синхронизированы');
    }, 2000);
  };

  const unpairDevice = (device) => {
    Alert.alert(
      'Отвязать устройство',
      `Вы уверены, что хотите отвязать ${device.name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отвязать',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = userData?.id || currentUser?.id;
              if (!userId) throw new Error('No user ID');
              
              const updatedDevices = devices.filter(d => d.id !== device.id);
              await AsyncStorage.setItem(`paired_devices_${userId}`, JSON.stringify(updatedDevices));
              setDevices(updatedDevices);
              Alert.alert('Успешно', 'Устройство отвязано');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось отвязать устройство');
            }
          }
        }
      ]
    );
  };

  const getDeviceIcon = (deviceName) => {
    if (deviceName.includes('Band')) return 'watch';
    if (deviceName.includes('Watch')) return 'watch';
    return 'hardware-chip';
  };

  // Экран загрузки
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Загрузка устройств...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Основной экран
  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Мои устройства</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.devicesList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="watch" size={64} color={theme.colors.lightGray} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                Нет подключенных устройств
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                Подключите браслет или часы RiskDetect для мониторинга здоровья
              </Text>
              <TouchableOpacity 
                style={[styles.addDeviceButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Scan')}
              >
                <Text style={[styles.addDeviceButtonText, { color: theme.colors.white }]}>
                  Подключить устройство
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            devices.map((device, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.deviceCard, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                  setSelectedDevice(device);
                  setShowDeviceModal(true);
                }}
              >
                <View style={[styles.deviceIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name={getDeviceIcon(device.name)} size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={[styles.deviceName, { color: theme.colors.text }]}>{device.name}</Text>
                  <Text style={[styles.deviceId, { color: theme.colors.textSecondary }]}>{device.id}</Text>
                  <View style={styles.deviceStatus}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={[styles.statusText, { color: theme.colors.success }]}>Подключено</Text>
                  </View>
                </View>
                <View style={styles.deviceBattery}>
                  <Ionicons name="battery-charging" size={24} color={theme.colors.primary} />
                  <Text style={[styles.batteryText, { color: theme.colors.textSecondary }]}>
                    {device.battery || 85}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {devices.length > 0 && (
            <View style={[styles.infoCard, { backgroundColor: theme.colors.info + '20' }]}>
              <Ionicons name="information-circle" size={20} color={theme.colors.info} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Вы можете подключить до 3 устройств одновременно
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Модальное окно управления устройством */}
        <Modal
          visible={showDeviceModal}
          transparent
          animationType="slide"
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Управление устройством
                </Text>
                <TouchableOpacity onPress={() => setShowDeviceModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.gray} />
                </TouchableOpacity>
              </View>

              {selectedDevice && (
                <>
                  <View style={styles.modalDeviceInfo}>
                    <Ionicons name="watch" size={48} color={theme.colors.primary} />
                    <Text style={[styles.modalDeviceName, { color: theme.colors.text }]}>
                      {selectedDevice.name}
                    </Text>
                    <Text style={[styles.modalDeviceId, { color: theme.colors.textSecondary }]}>
                      ID: {selectedDevice.id}
                    </Text>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.modalAction}
                      onPress={() => {
                        syncDevice(selectedDevice);
                        setShowDeviceModal(false);
                      }}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
                        <Ionicons name="sync" size={24} color={theme.colors.info} />
                      </View>
                      <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                        Синхронизировать
                      </Text>
                      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                        Обновить данные
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modalAction}
                      onPress={() => {
                        Alert.alert('Информация', `Версия прошивки: ${selectedDevice.firmware || '1.0.0'}`);
                      }}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: theme.colors.purple + '20' }]}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.purple} />
                      </View>
                      <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                        О устройстве
                      </Text>
                      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                        Версия, серийный номер
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modalAction}
                      onPress={() => {
                        unpairDevice(selectedDevice);
                        setShowDeviceModal(false);
                      }}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: theme.colors.error + '20' }]}>
                        <Ionicons name="trash" size={24} color={theme.colors.error} />
                      </View>
                      <Text style={[styles.actionTitle, { color: theme.colors.error }]}>
                        Отвязать
                      </Text>
                      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                        Удалить из списка
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}