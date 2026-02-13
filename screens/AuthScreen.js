import React, { useState } from 'react';
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

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/AuthStyles';

export default function AuthScreen({ navigation, setIsAuthenticated, setUserData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const usersJson = await AsyncStorage.getItem('users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        
        const user = users.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && 
          u.password === password
        );

        if (user) {
          await AsyncStorage.setItem('currentUser', JSON.stringify(user));
          await AsyncStorage.setItem('isAuthenticated', 'true');
          
          setUserData(user);
          setIsAuthenticated(true);
        } else {
          Alert.alert('Ошибка', 'Неверный email или пароль');
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при входе');
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
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.colors.primary }]}>
              RiskDetect
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Система мониторинга психологического состояния
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
                placeholder="Email"
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
                placeholder="Пароль"
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
                  Войти
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.switchAuth}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[styles.switchAuthText, { color: theme.colors.secondary }]}>
              Нет аккаунта? Зарегистрироваться
            </Text>
          </TouchableOpacity>

          <View style={[
            styles.infoSection, 
            { borderTopColor: theme.colors.border }
          ]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              О приложении
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              RiskDetect помогает отслеживать психологическое состояние, 
              вести дневник настроения, проходить тесты и получать 
              рекомендации от психологов.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}