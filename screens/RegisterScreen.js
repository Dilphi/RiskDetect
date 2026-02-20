import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar'; 

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/RegisterStyles';

export default function RegisterScreen({ navigation, setIsAuthenticated, setUserData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    occupation: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme } = useTheme();

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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (formData.age && formData.age.trim()) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        newErrors.age = 'Введите корректный возраст';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const userExists = users.some(user => 
        user.email.toLowerCase() === formData.email.toLowerCase()
      );
      
      if (userExists) {
        Alert.alert('Ошибка', 'Пользователь с таким email уже зарегистрирован');
        setLoading(false);
        return;
      }
      
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        registrationDate: new Date().toISOString(),
        riskLevel: 'низкий',
        riskPoints: 0,
        tests: [],
        sleepData: [],
        journalEntries: [],
        moodEntries: [],
      };
      
      delete newUser.confirmPassword;
      
      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      setUserData(newUser);
      setIsAuthenticated(true);
      
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось завершить регистрацию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Регистрация</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Создайте аккаунт для доступа ко всем функциям
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Имя и фамилия *</Text>
              <View style={[
                styles.inputContainer, 
                errors.name && styles.inputError,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: errors.name ? theme.colors.error : theme.colors.border 
                }
              ]}>
                <Ionicons name="person-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Введите имя и фамилию"
                  placeholderTextColor={theme.colors.lightGray}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({...formData, name: text});
                    setErrors({...errors, name: ''});
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.name ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
              <View style={[
                styles.inputContainer, 
                errors.email && styles.inputError,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: errors.email ? theme.colors.error : theme.colors.border 
                }
              ]}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="example@mail.com"
                  placeholderTextColor={theme.colors.lightGray}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({...formData, email: text});
                    setErrors({...errors, email: ''});
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.email ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Пароль *</Text>
              <View style={[
                styles.inputContainer, 
                errors.password && styles.inputError,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: errors.password ? theme.colors.error : theme.colors.border 
                }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Не менее 6 символов"
                  placeholderTextColor={theme.colors.lightGray}
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({...formData, password: text});
                    setErrors({...errors, password: ''});
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={theme.colors.lightGray} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Подтверждение пароля *</Text>
              <View style={[
                styles.inputContainer, 
                errors.confirmPassword && styles.inputError,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border 
                }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Повторите пароль"
                  placeholderTextColor={theme.colors.lightGray}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({...formData, confirmPassword: text});
                    setErrors({...errors, confirmPassword: ''});
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={theme.colors.lightGray} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.confirmPassword}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Возраст</Text>
              <View style={[
                styles.inputContainer, 
                errors.age && styles.inputError,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: errors.age ? theme.colors.error : theme.colors.border 
                }
              ]}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Необязательно"
                  placeholderTextColor={theme.colors.lightGray}
                  value={formData.age}
                  onChangeText={(text) => {
                    setFormData({...formData, age: text});
                    setErrors({...errors, age: ''});
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              {errors.age ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.age}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Пол</Text>
              <View style={styles.genderContainer}>
                {['Мужской', 'Женский', 'Другой'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonSelected,
                      { 
                        backgroundColor: formData.gender === gender ? theme.colors.primary : theme.colors.background,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => setFormData({...formData, gender})}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      { color: formData.gender === gender ? theme.colors.white : theme.colors.text }
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Род деятельности</Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border 
              }]}>
                <Ionicons name="briefcase-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Например: студент, учитель, врач"
                  placeholderTextColor={theme.colors.lightGray}
                  value={formData.occupation}
                  onChangeText={(text) => setFormData({...formData, occupation: text})}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                loading && styles.registerButtonDisabled,
                { backgroundColor: loading ? theme.colors.lightGray : theme.colors.primary }
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={[styles.registerButtonText, { color: theme.colors.white }]}>Зарегистрироваться</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginLink}>
            <Text style={[styles.loginLinkText, { color: theme.colors.textSecondary }]}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
              <Text style={[styles.loginLinkButton, { color: theme.colors.primary }]}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}