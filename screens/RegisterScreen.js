import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/RegisterStyles'

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>
              Создайте аккаунт для доступа ко всем функциям
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Имя и фамилия *</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#95a5a6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Введите имя и фамилию"
                  placeholderTextColor="#95a5a6"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({...formData, name: text});
                    setErrors({...errors, name: ''});
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#95a5a6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@mail.com"
                  placeholderTextColor="#95a5a6"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({...formData, email: text});
                    setErrors({...errors, email: ''});
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Пароль *</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#95a5a6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Не менее 6 символов"
                  placeholderTextColor="#95a5a6"
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
                    color="#95a5a6" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Подтверждение пароля *</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#95a5a6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Повторите пароль"
                  placeholderTextColor="#95a5a6"
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
                    color="#95a5a6" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Возраст</Text>
              <View style={[styles.inputContainer, errors.age && styles.inputError]}>
                <Ionicons name="calendar-outline" size={20} color="#95a5a6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Необязательно"
                  placeholderTextColor="#95a5a6"
                  value={formData.age}
                  onChangeText={(text) => {
                    setFormData({...formData, age: text});
                    setErrors({...errors, age: ''});
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Пол</Text>
              <View style={styles.genderContainer}>
                {['Мужской', 'Женский', 'Другой'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonSelected
                    ]}
                    onPress={() => setFormData({...formData, gender})}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      formData.gender === gender && styles.genderButtonTextSelected
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Род деятельности</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="briefcase-outline" size={20} color="#95a5a6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Например: студент, учитель, врач"
                  placeholderTextColor="#95a5a6"
                  value={formData.occupation}
                  onChangeText={(text) => setFormData({...formData, occupation: text})}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.loginLinkButton}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

