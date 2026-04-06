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
import styles from '../styles/AuthStyles';
import api from '../services/api'

export default function AuthScreen({ navigation, setIsAuthenticated, setUserData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

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

      return () => {
        NavigationBar.setVisibilityAsync('visible');
        NavigationBar.setButtonStyleAsync('dark');
      };
    }
  }, [theme.dark]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.fill_all_fields'));
      return;
    }

    setLoading(true);

    try {
      const response = await api.login({ email, password });
      
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor: theme.colors.background }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Переключатель языка */}
          <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 16 }}>
            <LanguageSwitcher />
          </View>

          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.colors.primary }]}>
              {t('common.app_name')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('auth.welcome')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border 
              }
            ]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.gray} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('auth.email')}
                placeholderTextColor={theme.colors.lightGray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border 
              }
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder={t('auth.password')}
                placeholderTextColor={theme.colors.lightGray}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={theme.colors.gray} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.authButton, 
                { backgroundColor: theme.colors.primary },
                loading && styles.authButtonDisabled
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={[styles.authButtonText, { color: theme.colors.white }]}>
                  {t('auth.login')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.switchAuth}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.switchAuthText, { color: theme.colors.secondary }]}>
              {t('auth.no_account')}
            </Text>
          </TouchableOpacity>

          <View style={[
            styles.infoSection, 
            { borderTopColor: theme.colors.border }
          ]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              {t('common.app_name')}
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {t('home.quote')}
            </Text>
          </View>
        </ScrollView>
       

      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}