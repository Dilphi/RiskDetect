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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/RegisterStyles';
import api from '../services/api'

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
  const { t } = useTranslation();

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
      newErrors.name = t('auth.enter_name');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.enter_email');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('auth.invalid_email');
    }

    if (!formData.password) {
      newErrors.password = t('auth.enter_password');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.password_length');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirm_password_placeholder');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwords_not_match');
    }

    if (formData.age && formData.age.trim()) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        newErrors.age = t('auth.enter_valid_age');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        occupation: formData.occupation
      });

      if (response.success) {
        setUserData(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
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
          {/* Переключатель языка */}
          <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 16 }}>
            <LanguageSwitcher />
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.register')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('auth.register_subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.name')} *</Text>
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
                  placeholder={t('auth.name_placeholder')}
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
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.email')} *</Text>
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
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.password')} *</Text>
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
                  placeholder={t('auth.password_placeholder')}
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
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.confirm_password')} *</Text>
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
                  placeholder={t('auth.confirm_password_placeholder')}
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
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.age')}</Text>
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
                  placeholder={t('auth.age_placeholder')}
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
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.gender')}</Text>
              <View style={styles.genderContainer}>
                {[t('auth.male'), t('auth.female'), t('auth.other')].map((gender) => (
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
              <Text style={[styles.label, { color: theme.colors.text }]}>{t('auth.occupation')}</Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border 
              }]}>
                <Ionicons name="briefcase-outline" size={20} color={theme.colors.lightGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder={t('auth.occupation_placeholder')}
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
                <Text style={[styles.registerButtonText, { color: theme.colors.white }]}>{t('auth.register')}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.loginLink}>
            <Text style={[styles.loginLinkText, { color: theme.colors.textSecondary }]}>{t('auth.have_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
              <Text style={[styles.loginLinkButton, { color: theme.colors.primary }]}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}