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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
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
  const [scanMode, setScanMode] = useState('qr');
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
  const { t } = useTranslation(); // <-- ДОБАВЛЕНО
  
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

  // ... остальные эффекты без изменений ...

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
        t('scan.unknown_device'),
        t('scan.qr_not_match'),
        [
          { text: t('scan.try_again'), onPress: () => setScanned(false) },
          { text: t('scan.enter_manual'), onPress: () => setScanMode('manual') }
        ]
      );
    }
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
      Alert.alert(t('scan.connection_error'), t('scan.connection_error_desc'));
    } finally {
      setIsConnecting(false);
    }
  };

  const confirmConnection = () => {
    setShowResultModal(false);
    setScanned(false);
    
    Alert.alert(
      t('scan.connected'),
      t('scan.connected_success', { deviceName: scanResult.device.name }),
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
      Alert.alert(t('common.error'), t('scan.enter_serial'));
    }
  };

  if (!permission) {
    return (
      <ScreenWrapper>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {t('scan.camera_access')}
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
            {t('scan.no_camera_access')}
          </Text>
          <Text style={[styles.permissionMessage, { color: theme.colors.textSecondary }]}>
            {t('scan.camera_access_needed')}
          </Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permissionButtonText, { color: theme.colors.white }]}>
              {t('scan.allow_camera')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.switchModeButton}
            onPress={() => setScanMode('ble')}
          >
            <Text style={[styles.switchModeText, { color: theme.colors.primary }]}>
              {t('scan.search_bluetooth')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Верхняя панель с переключателем языка */}
      <View style={[styles.header, { backgroundColor: theme.colors.header }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
          {scanMode === 'qr' ? t('scan.qr_scan') : 
           scanMode === 'ble' ? t('scan.ble_search') : t('scan.connecting')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LanguageSwitcher style={{ marginRight: 10 }} />
          <TouchableOpacity onPress={() => setTorch(!torch)}>
            <Ionicons name={torch ? "flash" : "flash-off"} size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* QR режим */}
      {scanMode === 'qr' && (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
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
                {t('scan.scan_qr')}
              </Text>
              <Text style={[styles.scanSubtitle, { color: theme.colors.white }]}>
                {t('scan.qr_location')}
              </Text>
            </View>

            {scanned && (
              <TouchableOpacity 
                style={[styles.scanAgainButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setScanned(false)}
              >
                <Ionicons name="refresh" size={20} color={theme.colors.white} />
                <Text style={[styles.scanAgainText, { color: theme.colors.white }]}>
                  {t('scan.scan_again')}
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
                  {t('scan.search_ble')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, { backgroundColor: theme.colors.overlay }]}
                onPress={() => setScanMode('manual')}
              >
                <Ionicons name="create" size={20} color={theme.colors.white} />
                <Text style={[styles.modeButtonText, { color: theme.colors.white }]}>
                  {t('scan.enter_manual')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      )}

      {/* BLE режим */}
      {scanMode === 'ble' && (
        <View style={[styles.bleContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.bleHeader}>
            <Ionicons name="bluetooth" size={48} color={theme.colors.info} />
            <Text style={[styles.bleTitle, { color: theme.colors.text }]}>{t('scan.ble_search')}</Text>
            <Text style={[styles.bleSubtitle, { color: theme.colors.textSecondary }]}>
              {t('scan.ble_instruction')}
            </Text>
          </View>

          {!isScanning && foundDevices.length === 0 && (
            <TouchableOpacity 
              style={[styles.startScanButton, { backgroundColor: theme.colors.primary }]}
              onPress={startBLEScan}
            >
              <Ionicons name="search" size={24} color={theme.colors.white} />
              <Text style={[styles.startScanText, { color: theme.colors.white }]}>
                {t('scan.start_search')}
              </Text>
            </TouchableOpacity>
          )}

          {isScanning && (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.scanningText, { color: theme.colors.textSecondary }]}>
                {t('scan.searching')}
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
                      {t('scan.battery')}: {device.battery}%
                    </Text>
                    <Text style={[styles.deviceDetail, { color: theme.colors.textSecondary }]}>
                      {t('scan.version')}: {device.firmware}
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
              {t('scan.scan_qr')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ручной режим */}
      {scanMode === 'manual' && (
        <View style={[styles.manualContainer, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="create" size={64} color={theme.colors.info} />
          <Text style={[styles.manualTitle, { color: theme.colors.text }]}>{t('scan.manual_connect')}</Text>
          <Text style={[styles.manualSubtitle, { color: theme.colors.textSecondary }]}>
            {t('scan.serial_location')}
          </Text>
          
          <TouchableOpacity 
            style={[styles.manualInputButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleManualEntry}
          >
            <Text style={[styles.manualInputText, { color: theme.colors.white }]}>
              {t('scan.enter_manual')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backToQRButton}
            onPress={() => setScanMode('qr')}
          >
            <Text style={[styles.backToQRText, { color: theme.colors.primary }]}>
              {t('scan.scan_qr')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Модальное окно ручного ввода */}
      <Modal visible={showManualModal} transparent animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('scan.manual_connect')}
              </Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.lightGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: theme.colors.text }]}>{t('scan.serial_number')}</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                placeholder={t('scan.enter_serial_placeholder')}
                placeholderTextColor={theme.colors.lightGray}
                value={manualSerial}
                onChangeText={setManualSerial}
                autoCapitalize="characters"
                maxLength={20}
              />
              <Text style={[styles.modalHint, { color: theme.colors.textSecondary }]}>
                {t('scan.serial_location')}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.border }]}
                onPress={() => setShowManualModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.primary }]}
                onPress={confirmManualEntry}
              >
                <Text style={[styles.modalButtonConfirmText, { color: theme.colors.white }]}>
                  {t('scan.connect')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Модальное окно результата */}
      <Modal visible={showResultModal} transparent animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            </View>
            
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('scan.device_found')}</Text>
            
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
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>{t('devices.model')}:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.model}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>{t('devices.serial')}:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.serialNumber}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>{t('devices.generation')}:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.generation}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>{t('devices.battery_life')}:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.battery_life}</Text>
                  </View>
                  <View style={styles.specRow}>
                    <Text style={[styles.specLabel, { color: theme.colors.textSecondary }]}>{t('devices.water_resistant')}:</Text>
                    <Text style={[styles.specValue, { color: theme.colors.text }]}>{scanResult.device.water_resistant}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>{t('devices.features')}:</Text>
                  <View style={styles.featuresGrid}>
                    {scanResult.device.features.slice(0, 6).map((feature, index) => {
                      const featureKey = feature === 'heart_rate' ? 'heart_rate' :
                                        feature === 'sleep_tracking' ? 'sleep' :
                                        feature === 'steps' ? 'steps' :
                                        feature === 'calories' ? 'calories' :
                                        feature === 'stress' ? 'stress' :
                                        feature === 'activity' ? 'activity' :
                                        feature === 'spo2' ? 'oxygen' :
                                        feature === 'temperature' ? 'temperature' :
                                        feature === 'fall_detection' ? 'fall_detection' :
                                        feature === 'panic_button' ? 'panic_button' :
                                        feature === 'gps' ? 'gps' :
                                        feature === 'ecg' ? 'ecg' :
                                        feature === 'blood_pressure' ? 'blood_pressure' : feature;
                      return (
                        <View key={index} style={[styles.featureItem, { 
                          backgroundColor: theme.colors.primary + '20',
                          borderColor: theme.colors.primary 
                        }]}>
                          <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                          <Text style={[styles.featureText, { color: theme.colors.text }]}>
                            {t(`devices.${featureKey}`)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {isSyncing ? (
              <View style={styles.syncContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>
                  {t('scan.syncing')}
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
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.colors.primary }]}
                  onPress={confirmConnection}
                  disabled={isConnecting || isSyncing}
                >
                  <Text style={[styles.modalButtonConfirmText, { color: theme.colors.white }]}>
                    {t('scan.connect')}
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
            {t('scan.connecting_to')}
          </Text>
        </View>
      )}

      {/* Список сопряженных устройств */}
      {pairedDevices.length > 0 && scanMode === 'qr' && !scanned && (
        <View style={[styles.pairedDevicesBar, { backgroundColor: theme.colors.primary + '90' }]}>
          <Text style={[styles.pairedDevicesTitle, { color: theme.colors.white }]}>
            {t('scan.paired_devices', { count: pairedDevices.length })}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Профиль' })}>
            <Text style={[styles.pairedDevicesLink, { color: theme.colors.white }]}>
              {t('scan.manage')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}