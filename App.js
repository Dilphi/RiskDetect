import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

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
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#2ecc71',
        },
        headerTintColor: 'white',
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
  return (
    <Stack.Navigator>
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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

// Главный компонент приложения
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка сохраненной сессии при запуске
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#7f8c8d' }}>Загрузка приложения...</Text>
      </View>
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