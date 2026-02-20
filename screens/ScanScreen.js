import React, { useState, useEffect, useRef } from 'react';

import { 
  Text, 
  View, 
  TextInput,
  TouchableOpacity, 
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView,
  Platform,
  Vibration,
  Animated,
  Easing
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Brightness from 'expo-brightness';
import { Audio } from 'expo-audio';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/ScanStyles';

// Имитация Bluetooth модуля (в реальном проекте будет использоваться react-native-ble-plx)
const mockBleManager = {
  scanForDevices: (callback) => {
    setTimeout(() => {
      callback([
        {
          id: 'RD-001-9A8B7C6D5E',
          name: 'RiskDetect Band 9',
          rssi: -45,
          manufacturer: 'RiskDetect',
          model: 'RD-B9',
          battery: 87,
          firmware: '2.1.4'
        },
        {
          id: 'RD-002-1F2E3D4C5B',
          name: 'RiskDetect Watch Pro',
          rssi: -62,
          manufacturer: 'RiskDetect',
          model: 'RD-WP1',
          battery: 94,
          firmware: '1.8.2'
        },
        {
          id: 'RD-003-7A8B9C0D1E',
          name: 'RiskDetect Band Lite',
          rssi: -38,
          manufacturer: 'RiskDetect',
          model: 'RD-BL',
          battery: 76,
          firmware: '3.0.1'
        }
      ]);
    }, 2000);
  },
  connectToDevice: (deviceId) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        id: deviceId,
        connected: true,
        services: ['heart_rate', 'steps', 'sleep', 'stress']
      }), 1500);
    });
  }
};

// Поддерживаемые устройства собственного производства
const ownDevices = [
  {
    id: 'RD-B9',
    name: 'RiskDetect Band 9',
    model: 'Браслет мониторинга',
    type: 'fitness_band',
    generation: 9,
    colors: ['черный', 'синий', 'зеленый'],
    features: [
      'heart_rate',
      'sleep_tracking',
      'steps',
      'calories',
      'stress',
      'activity',
      'spo2',
      'temperature',
      'fall_detection',
      'panic_button'
    ],
    sensors: [
      'PPG (фотоплетизмография)',
      '3-осевой акселерометр',
      'гироскоп',
      'датчик температуры',
      'SPO2 датчик'
    ],
    battery_life: '7-10 дней',
    water_resistant: '5ATM',
    qr_pattern: /^RD-B9-[0-9A-F]{12}$/i
  },
  {
    id: 'RD-WP1',
    name: 'RiskDetect Watch Pro',
    model: 'Умные часы',
    type: 'smartwatch',
    generation: 1,
    colors: ['черный', 'серебристый', 'золотой'],
    features: [
      'heart_rate',
      'sleep_tracking',
      'steps',
      'calories',
      'stress',
      'activity',
      'spo2',
      'temperature',
      'fall_detection',
      'panic_button',
      'gps',
      'ecg',
      'blood_pressure',
      'hydration',
      'meditation'
    ],
    sensors: [
      'PPG (фотоплетизмография)',
      '6-осевой IMU',
      'барометр',
      'компас',
      'GPS',
      'датчик ЭКГ',
      'датчик температуры',
      'SPO2 датчик'
    ],
    battery_life: '3-5 дней',
    water_resistant: '3ATM',
    qr_pattern: /^RD-WP1-[0-9A-F]{12}$/i
  },
  {
    id: 'RD-BL',
    name: 'RiskDetect Band Lite',
    model: 'Браслет базовый',
    type: 'fitness_band',
    generation: 2,
    colors: ['черный', 'белый', 'розовый'],
    features: [
      'heart_rate',
      'sleep_tracking',
      'steps',
      'calories',
      'activity'
    ],
    sensors: [
      'PPG (фотоплетизмография)',
      '3-осевой акселерометр'
    ],
    battery_life: '14 дней',
    water_resistant: 'IP68',
    qr_pattern: /^RD-BL-[0-9A-F]{12}$/i
  },
  {
    id: 'RD-BP1',
    name: 'RiskDetect Band Pro',
    model: 'Браслет профессиональный',
    type: 'fitness_band',
    generation: 1,
    colors: ['черный', 'серый'],
    features: [
      'heart_rate',
      'sleep_tracking',
      'steps',
      'calories',
      'stress',
      'activity',
      'spo2',
      'temperature',
      'fall_detection',
      'panic_button',
      'blood_pressure',
      'ecg'
    ],
    sensors: [
      'PPG (фотоплетизмография)',
      '6-осевой IMU',
      'датчик ЭКГ',
      'датчик температуры',
      'SPO2 датчик',
      'датчик кровяного давления'
    ],
    battery_life: '5-7 дней',
    water_resistant: '5ATM',
    qr_pattern: /^RD-BP1-[0-9A-F]{12}$/i
  }
];

export default function ScanScreen({ navigation, userData }) {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanMode, setScanMode] = useState('qr'); // 'qr', 'ble', 'manual'
  const [showResultModal, setShowResultModal] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [sound, setSound] = useState(null);
  const { theme } = useTheme();
  
  // Состояния для ручного ввода
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSerial, setManualSerial] = useState('');
  
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

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
    loadPairedDevices();
    startScanAnimation();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (permission && !permission.granted && scanMode === 'qr') {
      requestPermission();
    }
  }, [permission, scanMode]);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(scanLineAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const loadPairedDevices = async () => {
    try {
      const devices = await AsyncStorage.getItem(`paired_devices_${userData?.id}`);
      setPairedDevices(devices ? JSON.parse(devices) : []);
    } catch (error) {
      console.error('Error loading paired devices:', error);
    }
  };

  const playScanSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/scan.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Sound error:', error);
    }
  };

  const identifyDevice = (qrData) => {
    for (const device of ownDevices) {
      if (device.qr_pattern.test(qrData)) {
        return {
          ...device,
          serialNumber: qrData.split('-')[2],
          fullData: qrData
        };
      }
    }
    return null;
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    Vibration.vibrate(200);
    await playScanSound();

    const device = identifyDevice(data);
    
    if (device) {
      setScanResult({
        type: 'device',
        device: device,
        raw: data,
        timestamp: new Date().toISOString()
      });
      setShowResultModal(true);
    } else {
      Alert.alert(
        'Неизвестное устройство',
        'QR-код не соответствует ни одному устройству RiskDetect',
        [
          { text: 'Попробовать ещё раз', onPress: () => setScanned(false) },
          { text: 'Ввести вручную', onPress: () => setScanMode('manual') }
        ]
      );
    }
  };

  const startBLEScan = () => {
    setIsScanning(true);
    setFoundDevices([]);
    
    mockBleManager.scanForDevices((devices) => {
      setFoundDevices(devices);
      setIsScanning(false);
      Vibration.vibrate(200);
    });
  };

  const connectToDevice = async (device) => {
    setIsConnecting(true);
    
    try {
      await mockBleManager.connectToDevice(device.id);
      
      const connectedDevice = {
        ...device,
        connectedAt: new Date().toISOString(),
        lastSync: null
      };
      
      setSelectedDevice(connectedDevice);
      await syncDeviceData(connectedDevice);
      
    } catch (error) {
      Alert.alert('Ошибка подключения', 'Не удалось подключиться к устройству');
    } finally {
      setIsConnecting(false);
    }
  };

  const syncDeviceData = async (device) => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSyncProgress(i);
    }
    
    const healthData = {
      deviceId: device.id,
      deviceName: device.name,
      timestamp: new Date().toISOString(),
      heartRate: Math.floor(Math.random() * (85 - 60) + 60),
      steps: Math.floor(Math.random() * 8000) + 2000,
      calories: Math.floor(Math.random() * 400) + 200,
      sleep: {
        duration: Math.floor(Math.random() * (8 - 6) + 6),
        deep: Math.floor(Math.random() * (3 - 1) + 1),
        light: Math.floor(Math.random() * (4 - 2) + 2),
        rem: Math.floor(Math.random() * (2 - 1) + 1)
      },
      stress: Math.floor(Math.random() * 50) + 20,
      spo2: Math.floor(Math.random() * (98 - 95) + 95),
      temperature: (Math.random() * (36.9 - 36.1) + 36.1).toFixed(1),
      battery: device.battery || 85
    };

    await savePairedDevice(device);
    await saveHealthData(healthData);
    
    setIsSyncing(false);
  };

  const savePairedDevice = async (device) => {
    try {
      const updatedDevices = [...pairedDevices, device];
      await AsyncStorage.setItem(`paired_devices_${userData?.id}`, JSON.stringify(updatedDevices));
      setPairedDevices(updatedDevices);
    } catch (error) {
      console.error('Error saving paired device:', error);
    }
  };

  const saveHealthData = async (healthData) => {
    try {
      const existingData = await AsyncStorage.getItem(`health_data_${userData?.id}`);
      const healthDataArray = existingData ? JSON.parse(existingData) : [];
      healthDataArray.push(healthData);
      await AsyncStorage.setItem(`health_data_${userData?.id}`, JSON.stringify(healthDataArray));
    } catch (error) {
      console.error('Error saving health data:', error);
    }
  };

  const confirmConnection = () => {
    setShowResultModal(false);
    setScanned(false);
    
    Alert.alert(
      'Устройство подключено',
      `${scanResult.device.name} успешно синхронизирован. Данные о вашем здоровье сохранены.`,
      [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.navigate('Главная', { sync: true });
          }
        }
      ]
    );
  };

  const handleManualEntry = () => {
    setShowManualModal(true);
  };

  const confirmManualEntry = () => {
    if (manualSerial && manualSerial.length > 0) {
      const mockDevice = {
        id: `RD-MANUAL-${manualSerial}`,
        name: 'RiskDetect Device',
        model: 'Manual Entry',
        serialNumber: manualSerial
      };
      connectToDevice(mockDevice);
      setShowManualModal(false);
      setManualSerial('');
    } else {
      Alert.alert('Ошибка', 'Введите серийный номер');
    }
  };

  if (!permission) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            Запрос доступа к камере...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!permission.granted && scanMode === 'qr') {
    return (
      <ScreenWrapper>
        <View style={[styles.permissionContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="camera" size={64} color={theme.colors.error} />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Нет доступа к камере
          </Text>
          <Text style={[styles.permissionMessage, { color: theme.colors.textSecondary }]}>
            Для сканирования QR-кода устройства необходимо разрешить доступ к камере
          </Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: theme.colors.white }]}>
              Разрешить камеру
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.switchModeButton}
            onPress={() => setScanMode('ble')}
          >
            <Text style={[styles.switchModeText, { color: theme.colors.primary }]}>
              Искать через Bluetooth
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Верхняя панель */}
      <View style={[styles.header, { backgroundColor: theme.colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {scanMode === 'qr' ? 'Сканер устройства' : 
           scanMode === 'ble' ? 'Поиск устройств' : 'Подключение'}
        </Text>
        <TouchableOpacity onPress={() => setTorch(!torch)}>
          <Ionicons name={torch ? "flash" : "flash-off"} size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Режим QR-сканирования */}
      {scanMode === 'qr' && (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          enableTorch={torch}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <Animated.View 
                style={[
                  styles.scanLine,
                  {
                    backgroundColor: theme.colors.primary,
                    transform: [{
                      translateY: scanLineAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 250]
                      })
                    }]
                  }
                ]} 
              />
              <View style={[styles.corner, styles.cornerTL, { borderColor: theme.colors.primary }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: theme.colors.primary }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: theme.colors.primary }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: theme.colors.primary }]} />
            </View>
            
            <View style={styles.scanInfo}>
              <Text style={[styles.scanTitle, { color: theme.colors.white }]}>
                Сканируйте QR-код устройства
              </Text>
              <Text style={[styles.scanSubtitle, { color: theme.colors.white }]}>
                QR-код находится на задней панели браслета или часов
              </Text>
            </View>

            {scanned && (
              <TouchableOpacity 
                style={[styles.scanAgainButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="refresh" size={20} color={theme.colors.white} />
                <Text style={[styles.scanAgainText, { color: theme.colors.white }]}>
                  Сканировать ещё раз
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.modeSwitcher}>
              <TouchableOpacity 
                style={[styles.modeButton, { backgroundColor: theme.colors.overlay }]}
                onPress={() => setScanMode('ble')}
              >
                <Ionicons name="bluetooth" size={20} color={theme.colors.white} />
                <Text style={[styles.modeButtonText, { color: theme.colors.white }]}>
                  Поиск по Bluetooth
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, { backgroundColor: theme.colors.overlay }]}
                onPress={() => setScanMode('manual')}
              >
                <Ionicons name="create" size={20} color={theme.colors.white} />
                <Text style={[styles.modeButtonText, { color: theme.colors.white }]}>
                  Ввести вручную
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}

      {/* Режим Bluetooth поиска */}
      {scanMode === 'ble' && (
        <View style={[styles.bleContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.bleHeader}>
            <Ionicons name="bluetooth" size={48} color={theme.colors.info} />
            <Text style={[styles.bleTitle, { color: theme.colors.text }]}>Поиск устройств</Text>
            <Text style={[styles.bleSubtitle, { color: theme.colors.textSecondary }]}>
              Убедитесь, что Bluetooth включен и устройство находится рядом
            </Text>
          </View>

          {!isScanning && foundDevices.length === 0 && (
            <TouchableOpacity 
              style={[styles.startScanButton, { backgroundColor: theme.colors.primary }]}
              onPress={startBLEScan}
            >
              <Ionicons name="search" size={24} color={theme.colors.white} />
              <Text style={[styles.startScanText, { color: theme.colors.white }]}>
                Начать поиск
              </Text>
            </TouchableOpacity>
          )}

          {isScanning && (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.scanningText, { color: theme.colors.textSecondary }]}>
                Поиск устройств...
              </Text>
            </View>
          )}

          <ScrollView style={styles.devicesList}>
            {foundDevices.map((device, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.deviceCard, { backgroundColor: theme.colors.card }]}
                onPress={() => connectToDevice(device)}
                disabled={isConnecting}
              >
                <View style={[styles.deviceIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="watch" size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={[styles.deviceName, { color: theme.colors.text }]}>{device.name}</Text>
                  <Text style={[styles.deviceId, { color: theme.colors.textSecondary }]}>ID: {device.id}</Text>
                  <View style={styles.deviceDetails}>
                    <Text style={[styles.deviceDetail, { color: theme.colors.textSecondary }]}>
                      Батарея: {device.battery}%
                    </Text>
                    <Text style={[styles.deviceDetail, { color: theme.colors.textSecondary }]}>
                      Версия: {device.firmware}
                    </Text>
                  </View>
                </View>
                <View style={styles.deviceSignal}>
                  <Ionicons 
                    name="cellular" 
                    size={24} 
                    color={device.rssi > -50 ? theme.colors.success : 
                           device.rssi > -70 ? theme.colors.warning : theme.colors.error} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.backToQRButton}
            onPress={() => setScanMode('qr')}
          >
            <Text style={[styles.backToQRText, { color: theme.colors.primary }]}>
              Сканировать QR-код
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Режим ручного ввода */}
      {scanMode === 'manual' && (
        <View style={[styles.manualContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="create" size={64} color={theme.colors.info} />
          <Text style={[styles.manualTitle, { color: theme.colors.text }]}>Ручное подключение</Text>
          <Text style={[styles.manualSubtitle, { color: theme.colors.textSecondary }]}>
            Введите серийный номер, который находится на задней панели устройства
          </Text>
          
          <TouchableOpacity 
            style={[styles.manualInputButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleManualEntry}
          >
            <Text style={[styles.manualInputText, { color: theme.colors.white }]}>
              Ввести серийный номер
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backToQRButton}
            onPress={() => setScanMode('qr')}
          >
            <Text style={[styles.backToQRText, { color: theme.colors.primary }]}>
              Сканировать QR-код
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Модальное окно ручного ввода */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Ручное подключение
              </Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>Серийный номер</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder="Введите серийный номер"
                placeholderTextColor={theme.colors.lightGray}
                value={manualSerial}
                onChangeText={setManualSerial}
                autoCapitalize="characters"
                maxLength={20}
              />
              <Text style={[styles.modalHint, { color: theme.colors.textSecondary }]}>
                Серийный номер находится на задней панели устройства
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.border }]}
                onPress={() => setShowManualModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.primary }]}
                onPress={confirmManualEntry}
              >
                <Text style={[styles.modalButtonConfirmText, { color: theme.colors.white }]}>
                  Подключить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно результата сканирования */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Устройство найдено!</Text>
            
            {scanResult && (
              <View style={[styles.deviceInfoCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.deviceInfoHeader}>
                  <Ionicons name="watch" size={32} color={theme.colors.primary} />
                  <Text style={[styles.deviceInfoName, { color: theme.colors.text }]}>
                    {scanResult.device.name}
                  </Text>
                </View>
                
                <View style={styles.deviceSpecs}>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>Модель:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.model}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>Серийный номер:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.serialNumber}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>Поколение:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.generation}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>Батарея:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.battery_life}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>Защита от воды:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.water_resistant}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>Доступные функции:</Text>
                  <View style={styles.featuresGrid}>
                    {scanResult.device.features.slice(0, 6).map((feature, index) => (
                      <View key={index} style={[styles.featureItem, { 
                        backgroundColor: theme.colors.primary + '20',
                        borderColor: theme.colors.primary 
                      }]}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                        <Text style={[styles.featureText, { color: theme.colors.text }]}>
                          {feature === 'heart_rate' ? 'Пульс' :
                           feature === 'sleep_tracking' ? 'Сон' :
                           feature === 'steps' ? 'Шаги' :
                           feature === 'calories' ? 'Калории' :
                           feature === 'stress' ? 'Стресс' :
                           feature === 'activity' ? 'Активность' :
                           feature === 'spo2' ? 'Кислород' :
                           feature === 'temperature' ? 'Температура' :
                           feature === 'fall_detection' ? 'Падения' :
                           feature === 'panic_button' ? 'Тревога' :
                           feature === 'gps' ? 'GPS' :
                           feature === 'ecg' ? 'ЭКГ' :
                           feature === 'blood_pressure' ? 'Давление' :
                           feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {isSyncing ? (
              <View style={styles.syncContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>
                  Синхронизация данных...
                </Text>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.progressFill, { 
                    width: `${syncProgress}%`,
                    backgroundColor: theme.colors.primary 
                  }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {syncProgress}%
                </Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowResultModal(false);
                    setScanned(false);
                  }}
                >
                  <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                    Отмена
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.primary }]}
                  onPress={confirmConnection}
                  disabled={isConnecting || isSyncing}
                >
                  <Text style={[styles.modalButtonConfirmText, { color: theme.colors.white }]}>
                    Подключить
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Индикатор подключения */}
      {isConnecting && (
        <View style={[styles.connectingOverlay, { backgroundColor: theme.colors.overlay }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.connectingText, { color: theme.colors.text }]}>
            Подключение к устройству...
          </Text>
        </View>
      )}

      {/* Список сопряженных устройств (если есть) */}
      {pairedDevices.length > 0 && scanMode === 'qr' && !scanned && (
        <View style={[styles.pairedDevicesBar, { backgroundColor: theme.colors.primary + '90' }]}>
          <Text style={[styles.pairedDevicesTitle, { color: theme.colors.white }]}>
            Сопряженные устройства: {pairedDevices.length}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', {
            screen: 'Профиль'
          })}>
            <Text style={[styles.pairedDevicesLink, { color: theme.colors.white }]}>
              Управление
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}