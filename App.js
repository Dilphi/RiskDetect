import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

import { ThemeProvider, useTheme } from './components/ThemeContext';
import { NotificationProvider } from './components/NotificationContext';
import { TranslationProvider, useTranslation } from './components/Translation'; 
import { ScreenWrapper } from './components/ScreenWrapper';


import HomeScreen from './screens/HomeScreen';

import SleepScreen from './screens/SleepScreen';
import ScanScreen from './screens/ScanScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import RegisterScreen from './screens/RegisterScreen';
import TestScreen from './screens/TestScreen';
import TestResultScreen from './screens/TestResultScreen';
import JournalScreen from './screens/JournalScreen';
import JournalEntryScreen from './screens/JournalEntryScreen';
import PsychologistScreen from './screens/PsychologistScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import StatisticsScreen from './screens/StatisticsScreen';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Главные табы для авторизованных пользователей
function MainTabs({ userData, onLogout }) {
  const { theme } = useTheme();
  const { t } = useTranslation(); 
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === t('home.title')) iconName = focused ? 'home' : 'home-outline';
          else if (route.name === t('sleep.title')) iconName = focused ? 'moon' : 'moon-outline';
          else if (route.name === t('tests.title')) iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === t('profile.title')) iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.lightGray,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.header,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name={t('home.title')} options={{ title: t('home.title') }}>
        {(props) => <HomeScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen name={t('sleep.title')} options={{ title: t('sleep.title') }}>
        {(props) => <SleepScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen name={t('tests.title')} options={{ title: t('tests.title') }}>
        {(props) => <TestScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen name={t('profile.title')} options={{ title: t('profile.title') }}>
        {(props) => <ProfileScreen {...props} userData={userData} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Стек навигации для авторизованных пользователей
function MainStack({ userData, onLogout }) {
  const { theme } = useTheme();
  const { t } = useTranslation(); 
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.header,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        options={{ headerShown: false }}
      >
        {(props) => <MainTabs {...props} userData={userData} onLogout={onLogout} />}
      </Stack.Screen>
      
      <Stack.Screen 
        name="TestResult" 
        component={TestResultScreen}
        options={{ title: t('tests.result') }}
      />
      <Stack.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{ title: t('journal.title') }}
      />
      <Stack.Screen 
        name="JournalEntry" 
        component={JournalEntryScreen}
        options={{ title: t('journal.entry') }}
      />
      <Stack.Screen 
        name="Psychologist" 
        component={PsychologistScreen}
        options={{ title: t('psychologist.title') }}
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{ title: t('emergency.title') }}
      />
      <Stack.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{ title: t('statistics.title') }}
      />
      <Stack.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{ title: t('scan.title') }}
      />
    </Stack.Navigator>
  );
}

// Навигация для неавторизованных пользователей
function AuthStack({ setIsAuthenticated, setUserData }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name="Auth">
        {(props) => (
          <AuthScreen 
            {...props} 
            setIsAuthenticated={setIsAuthenticated}
            setUserData={setUserData}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => (
          <RegisterScreen 
            {...props} 
            setIsAuthenticated={setIsAuthenticated}
            setUserData={setUserData}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Внутренний компонент с доступом к теме
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { t } = useTranslation(); 

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AsyncStorage.getItem('isAuthenticated');
      const user = await AsyncStorage.getItem('currentUser');
      
      if (isAuth === 'true' && user) {
        setIsAuthenticated(true);
        setUserData(JSON.parse(user));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isAuthenticated');
      await AsyncStorage.removeItem('currentUser');
      setIsAuthenticated(false);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ 
            marginTop: 16, 
            fontSize: 16, 
            color: theme.colors.textSecondary 
          }}>
            {t('common.loading')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainStack userData={userData} onLogout={handleLogout} />
      ) : (
        <AuthStack 
          setIsAuthenticated={setIsAuthenticated}
          setUserData={setUserData}
        />
      )}
    </NavigationContainer>
  );
}

// Главный компонент приложения с провайдерами
export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <TranslationProvider> 
          <AppContent />
        </TranslationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}