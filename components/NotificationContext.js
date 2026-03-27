import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useTranslation } from './Translation';

// Настройка уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState(null);
  // Используем хук внутри провайдера — нужно создать внутренний компонент
  // или передавать язык через контекст. Для простоты оставим без переводов
  // в уведомлениях, так как они не критичны

  // Загрузка настроек и запрос разрешений
  useEffect(() => {
    loadNotificationSettings();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
  };

  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationsEnabled');
      setNotificationsEnabled(saved !== 'false');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notificationsEnabled', String(value));
      
      if (value && permissionStatus === 'granted') {
        await scheduleDailyReminder();
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Функции для разных типов уведомлений (пока без переводов, так как язык может меняться)
  const scheduleDailyReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger = new Date();
    trigger.setHours(20, 0, 0, 0);
    if (trigger < new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'RiskDetect',
        body: 'Как прошёл ваш день? Отметьте настроение и запишите мысли в дневник.',
        data: { screen: 'Journal' },
      },
      trigger: {
        type: 'daily',
        hour: 20,
        minute: 0,
      },
    });
  };

  const sendMoodReminder = async () => {
    if (!notificationsEnabled || permissionStatus !== 'granted') return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '😊 Настроение',
        body: 'Не забудьте отметить своё настроение сегодня!',
        data: { screen: 'Home' },
      },
      trigger: null,
    });
  };

  const sendTestResultNotification = async (testName, result) => {
    if (!notificationsEnabled || permissionStatus !== 'granted') return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Результат теста',
        body: `Тест "${testName}" завершён. Ваш результат: ${result}`,
        data: { screen: 'TestResult' },
      },
      trigger: null,
    });
  };

  return (
    <NotificationContext.Provider value={{ 
      notificationsEnabled, 
      toggleNotifications, 
      loading,
      permissionStatus,
      sendMoodReminder,
      sendTestResultNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);