import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

import { ThemeProvider, useTheme } from './components/ThemeContext';
import { NotificationProvider } from './components/NotificationContext';
import { ScreenWrapper } from './components/ScreenWrapper';

// Экраны
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
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Главная') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Сон') iconName = focused ? 'moon' : 'moon-outline';
          else if (route.name === 'Тесты') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Профиль') iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen name="Главная">
        {(props) => <HomeScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen name="Сон">
        {(props) => <SleepScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen name="Тесты">
        {(props) => <TestScreen {...props} userData={userData} />}
      </Tab.Screen>
      <Tab.Screen name="Профиль">
        {(props) => <ProfileScreen {...props} userData={userData} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Стек навигации для авторизованных пользователей
function MainStack({ userData, onLogout }) {
  const { theme } = useTheme();
  
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
        options={{ title: 'Результат теста' }}
      />
      <Stack.Screen 
        name="Journal" 
        component={JournalScreen}
        options={{ title: 'Дневник' }}
      />
      <Stack.Screen 
        name="JournalEntry" 
        component={JournalEntryScreen}
        options={{ title: 'Запись' }}
      />
      <Stack.Screen 
        name="Psychologist" 
        component={PsychologistScreen}
        options={{ title: 'Психолог' }}
      />
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{ title: 'Экстренная помощь' }}
      />
      <Stack.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{ title: 'Статистика' }}
      />
      <Stack.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{ title: 'Сканер QR-кода' }}
      />
    </Stack.Navigator>
  );
}

// Навигация для неавторизованных пользователей
function AuthStack({ setIsAuthenticated, setUserData }) {
  const { theme } = useTheme();
  
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
            Загрузка приложения...
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
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}