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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
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

      return () => {
        NavigationBar.setVisibilityAsync('visible');
        NavigationBar.setButtonStyleAsync('dark');
      };
    }
  }, [theme.dark]);

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
        Alert.alert(t('common.error'), t('devices.user_not_authorized'));
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
      Alert.alert(t('common.error'), t('devices.load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const userId = userData?.id || currentUser?.id;
    if (userId) {
      await loadDevices(userId);
    } else {
      setRefreshing(false);
      Alert.alert(t('common.error'), t('devices.user_not_identified'));
    }
  };

  const syncDevice = async (device) => {
    Alert.alert(t('devices.sync_title'), t('devices.sync_with') + ` ${device.name}...`);
    setTimeout(() => {
      Alert.alert(t('common.success'), t('devices.sync_success'));
    }, 2000);
  };

  const unpairDevice = (device) => {
    Alert.alert(
      t('devices.unpair_title'),
      t('devices.unpair_confirm') + ` ${device.name}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('devices.unpair'),
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = userData?.id || currentUser?.id;
              if (!userId) throw new Error('No user ID');
              
              const updatedDevices = devices.filter(d => d.id !== device.id);
              await AsyncStorage.setItem(`paired_devices_${userId}`, JSON.stringify(updatedDevices));
              setDevices(updatedDevices);
              Alert.alert(t('common.success'), t('devices.unpair_success'));
            } catch (error) {
              Alert.alert(t('common.error'), t('devices.unpair_error'));
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

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('devices.loading_devices')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Заголовок с переключателем языка */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('devices.my_devices')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <LanguageSwitcher style={{ marginRight: 10 }} />
            <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
              <Ionicons name="add" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
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
                {t('devices.no_devices')}
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                {t('devices.connect_device')}
              </Text>
              <TouchableOpacity 
                style={[styles.addDeviceButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Scan')}
              >
                <Text style={[styles.addDeviceButtonText, { color: theme.colors.white }]}>
                  {t('devices.add_device')}
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
                    <Text style={[styles.statusText, { color: theme.colors.success }]}>{t('devices.connected')}</Text>
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
                {t('devices.connect_limit')}
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
                  {t('devices.device_management')}
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
                        {t('devices.sync')}
                      </Text>
                      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                        {t('devices.sync_data')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modalAction}
                      onPress={() => {
                        Alert.alert(t('devices.about_device'), `${t('devices.version')}: ${selectedDevice.firmware || '1.0.0'}`);
                      }}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: theme.colors.purple + '20' }]}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.purple} />
                      </View>
                      <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                        {t('devices.about_device')}
                      </Text>
                      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                        {t('devices.version_serial')}
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
                        {t('devices.unpair')}
                      </Text>
                      <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                        {t('devices.remove_from_list')}
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