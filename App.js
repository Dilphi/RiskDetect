import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Экраны
import HomeScreen from './screens/HomeScreen';
import SlipScreen from './screens/SlipScreen';
import ScanScreen from './screens/ScanScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen'; 
import RegisterScreen from './screens/RegisterScreen'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Главные табы для авторизованных пользователей
function MainTabs({ userId }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Главная') iconName = 'home';
          else if (route.name === 'Сон') iconName = 'slip';
          else if (route.name === 'Сканер') iconName = 'qr-code';
          else if (route.name === 'Профиль') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Главная">
        {(props) => <HomeScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Сон" component={SlipScreen} />
      <Tab.Screen name="Сканер" component={ScanScreen} />
      <Tab.Screen name="Профиль">
        {(props) => <ProfileScreen {...props} userId={userId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Навигация для неавторизованных пользователей
function AuthStack({ setIsAuthenticated, setUserId }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth">
        {(props) => (
          <AuthScreen 
            {...props} 
            setIsAuthenticated={setIsAuthenticated}
            setUserId={setUserId}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Главный компонент приложения
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabs userId={userId} />
      ) : (
        <AuthStack 
          setIsAuthenticated={setIsAuthenticated}
          setUserId={setUserId}
        />
      )}
    </NavigationContainer>
  );
}