import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/DeviceManagerStyles';

export default function DeviceManagerScreen({ navigation, userData }) {
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const devicesData = await AsyncStorage.getItem(`paired_devices_${userData?.id}`);
      setDevices(devicesData ? JSON.parse(devicesData) : []);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevices();
    setRefreshing(false);
  };

  const syncDevice = async (device) => {
    Alert.alert('Синхронизация', `Синхронизация с ${device.name}...`);
    // Имитация синхронизации
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
              const updatedDevices = devices.filter(d => d.id !== device.id);
              await AsyncStorage.setItem(`paired_devices_${userData?.id}`, JSON.stringify(updatedDevices));
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

  return (
    <ScreenWrapper>

      
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.title}>Мои устройства</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
              <Ionicons name="add" size={24} color="#2ecc71" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.devicesList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {devices.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="watch" size={64} color="#bdc3c7" />
                <Text style={styles.emptyStateTitle}>Нет подключенных устройств</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Подключите браслет или часы RiskDetect для мониторинга здоровья
                </Text>
                <TouchableOpacity 
                  style={styles.addDeviceButton}
                  onPress={() => navigation.navigate('Scan')}
                >
                  <Text style={styles.addDeviceButtonText}>Подключить устройство</Text>
                </TouchableOpacity>
              </View>
            ) : (
              devices.map((device, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.deviceCard}
                  onPress={() => {
                    setSelectedDevice(device);
                    setShowDeviceModal(true);
                  }}
                >
                  <View style={styles.deviceIcon}>
                    <Ionicons name={getDeviceIcon(device.name)} size={32} color="#2ecc71" />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceId}>{device.id}</Text>
                    <View style={styles.deviceStatus}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Подключено</Text>
                    </View>
                  </View>
                  <View style={styles.deviceBattery}>
                    <Ionicons name="battery-charging" size={24} color="#2ecc71" />
                    <Text style={styles.batteryText}>{device.battery || 85}%</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {devices.length > 0 && (
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color="#3498db" />
                <Text style={styles.infoText}>
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
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Управление устройством</Text>
                  <TouchableOpacity onPress={() => setShowDeviceModal(false)}>
                    <Ionicons name="close" size={24} color="#7f8c8d" />
                  </TouchableOpacity>
                </View>

                {selectedDevice && (
                  <>
                    <View style={styles.modalDeviceInfo}>
                      <Ionicons name="watch" size={48} color="#2ecc71" />
                      <Text style={styles.modalDeviceName}>{selectedDevice.name}</Text>
                      <Text style={styles.modalDeviceId}>ID: {selectedDevice.id}</Text>
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={styles.modalAction}
                        onPress={() => {
                          syncDevice(selectedDevice);
                          setShowDeviceModal(false);
                        }}
                      >
                        <View style={[styles.actionIcon, { backgroundColor: '#3498db20' }]}>
                          <Ionicons name="sync" size={24} color="#3498db" />
                        </View>
                        <Text style={styles.actionTitle}>Синхронизировать</Text>
                        <Text style={styles.actionSubtitle}>Обновить данные</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.modalAction}
                        onPress={() => {
                          Alert.alert('Информация', `Версия прошивки: ${selectedDevice.firmware || '1.0.0'}`);
                        }}
                      >
                        <View style={[styles.actionIcon, { backgroundColor: '#9b59b620' }]}>
                          <Ionicons name="information-circle" size={24} color="#9b59b6" />
                        </View>
                        <Text style={styles.actionTitle}>О устройстве</Text>
                        <Text style={styles.actionSubtitle}>Версия, серийный номер</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.modalAction}
                        onPress={() => {
                          unpairDevice(selectedDevice);
                          setShowDeviceModal(false);
                        }}
                      >
                        <View style={[styles.actionIcon, { backgroundColor: '#e74c3c20' }]}>
                          <Ionicons name="trash" size={24} color="#e74c3c" />
                        </View>
                        <Text style={[styles.actionTitle, { color: '#e74c3c' }]}>Отвязать</Text>
                        <Text style={styles.actionSubtitle}>Удалить из списка</Text>
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

