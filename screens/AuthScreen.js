import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen({ navigation, setIsAuthenticated, setUserData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true = вход, false = регистрация
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  // Моковые пользователи (в реальном приложении хранить в AsyncStorage)
  const mockUsers = [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password123',
      name: 'Алексей Иванов',
      age: 15,
      role: 'student',
      psychologist: 'Иванова Мария Петровна',
      contact: '+7 (999) 123-45-67'
    },
    {
      id: 2,
      email: 'psychologist@example.com',
      password: 'psych123',
      name: 'Мария Петровна',
      age: 35,
      role: 'psychologist',
      speciality: 'Детский психолог',
      experience: '10 лет'
    },
    {
      id: 3,
      email: 'parent@example.com',
      password: 'parent123',
      name: 'Ольга Сидорова',
      age: 42,
      role: 'parent',
      childName: 'Сергей Сидоров',
      childAge: 14
    }
  ];

  // Сохраняем пользователя в AsyncStorage при регистрации
  const saveUserToStorage = async (user) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  };

  // Загрузка пользователя из AsyncStorage
  const loadUserFromStorage = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  };

  const handleAuth = async () => {
    // Валидация
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    if (!isLogin) {
      if (!name.trim() || !age.trim()) {
        Alert.alert('Ошибка', 'Заполните все поля');
        return;
      }
      
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 18) {
        Alert.alert('Ошибка', 'Введите возраст от 10 до 18 лет');
        return;
      }
    }

    setLoading(true);

    // Имитация задержки сети
    setTimeout(async () => {
      try {
        if (isLogin) {
          // Логика входа
          const user = mockUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
          );

          if (user) {
            // Сохраняем в AsyncStorage
            await saveUserToStorage(user);
            
            // Передаем данные в родительский компонент
            if (setUserData) {
              setUserData(user);
            }
            if (setIsAuthenticated) {
              setIsAuthenticated(true);
            }
            
            Alert.alert('Успешно', `Добро пожаловать, ${user.name}!`);
          } else {
            Alert.alert('Ошибка', 'Неверный email или пароль');
          }
        } else {
          // Логика регистрации
          const existingUser = mockUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase()
          );

          if (existingUser) {
            Alert.alert('Ошибка', 'Пользователь с таким email уже существует');
            return;
          }

          const newUser = {
            id: mockUsers.length + 1,
            email: email.toLowerCase(),
            password: password,
            name: name,
            age: parseInt(age),
            role: 'student', // По умолчанию студент
            registeredDate: new Date().toISOString().split('T')[0]
          };

          // Добавляем нового пользователя (в реальном приложении - отправка на сервер)
          mockUsers.push(newUser);
          
          // Сохраняем в AsyncStorage
          await saveUserToStorage(newUser);
          
          // Передаем данные
          if (setUserData) {
            setUserData(newUser);
          }
          if (setIsAuthenticated) {
            setIsAuthenticated(true);
          }
          
          Alert.alert('Успешно', 'Регистрация завершена!');
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Произошла ошибка при аутентификации');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  // Автовход для демонстрации
  const handleDemoLogin = (role) => {
    let demoUser;
    
    switch(role) {
      case 'student':
        demoUser = mockUsers[0];
        break;
      case 'psychologist':
        demoUser = mockUsers[1];
        break;
      case 'parent':
        demoUser = mockUsers[2];
        break;
      default:
        demoUser = mockUsers[0];
    }
    
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    
    // Автоматический вход через 500мс
    setTimeout(() => {
      handleAuth();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Логотип и заголовок */}
          <View style={styles.header}>
            <Text style={styles.logo}>RiskDetect</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Вход в систему' : 'Регистрация'}
            </Text>
          </View>

          {/* Форма */}
          <View style={styles.form}>
            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Имя и фамилия"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Возраст (10-18 лет)"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>
                {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Переключение между входом и регистрацией */}
          <TouchableOpacity 
            style={styles.switchAuth}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchAuthText}>
              {isLogin 
                ? 'Нет аккаунта? Зарегистрироваться' 
                : 'Уже есть аккаунт? Войти'}
            </Text>
          </TouchableOpacity>

          {/* Демо доступы */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Демо доступ:</Text>
            
            <View style={styles.demoButtons}>
              <TouchableOpacity 
                style={[styles.demoButton, styles.demoStudent]}
                onPress={() => handleDemoLogin('student')}
              >
                <Text style={styles.demoButtonText}>Ученик</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.demoButton, styles.demoPsychologist]}
                onPress={() => handleDemoLogin('psychologist')}
              >
                <Text style={styles.demoButtonText}>Психолог</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.demoButton, styles.demoParent]}
                onPress={() => handleDemoLogin('parent')}
              >
                <Text style={styles.demoButtonText}>Родитель</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Информация о системе */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>О системе RiskDetect</Text>
            <Text style={styles.infoText}>
              Система для мониторинга психологического состояния учащихся. 
              Все данные анонимны и защищены.
            </Text>
            <Text style={styles.privacyText}>
              Нажимая "Войти", вы соглашаетесь с политикой конфиденциальности
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#2d3436',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  authButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchAuth: {
    alignItems: 'center',
    marginBottom: 32,
  },
  switchAuthText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
  demoSection: {
    marginBottom: 32,
  },
  demoTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  demoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
  },
  demoStudent: {
    backgroundColor: '#3498db',
  },
  demoPsychologist: {
    backgroundColor: '#9b59b6',
  },
  demoParent: {
    backgroundColor: '#e67e22',
  },
  demoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoSection: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#dfe6e9',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});