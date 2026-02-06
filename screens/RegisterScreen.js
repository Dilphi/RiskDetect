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

export default function RegisterScreen({ navigation, setIsAuthenticated, setUserData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    role: 'student', // student, parent, psychologist
    gender: '',
    school: '',
    grade: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Многошаговая регистрация
  const [errors, setErrors] = useState({});

  // Валидация email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (step === 1) {
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
    }

    if (step === 2) {
      if (!formData.age) {
        newErrors.age = 'Введите возраст';
      } else {
        const ageNum = parseInt(formData.age);
        if (isNaN(ageNum) || ageNum < 10 || ageNum > 18) {
          newErrors.age = 'Возраст должен быть от 10 до 18 лет';
        }
      }
      if (!formData.gender) {
        newErrors.gender = 'Выберите пол';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик изменения полей формы
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Очищаем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Переход к следующему шагу
  const handleNextStep = () => {
    if (validateForm()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleRegister();
      }
    }
  };

  // Возврат к предыдущему шагу
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Основная логика регистрации
  const handleRegister = async () => {
    setLoading(true);
    
    // Имитация задержки сети
    setTimeout(async () => {
      try {
        // Проверяем, нет ли уже такого пользователя в AsyncStorage
        const existingUsersJson = await AsyncStorage.getItem('users');
        const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];
        
        const userExists = existingUsers.some(user => 
          user.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (userExists) {
          Alert.alert('Ошибка', 'Пользователь с таким email уже зарегистрирован');
          setLoading(false);
          return;
        }
        
        // Создаем нового пользователя
        const newUser = {
          id: Date.now(), // Используем timestamp как ID
          ...formData,
          age: parseInt(formData.age),
          registrationDate: new Date().toISOString(),
          riskPoints: 0,
          riskLevel: 'низкий',
          lastCheck: new Date().toISOString().split('T')[0],
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          psychologist: 'Иванова М.П.', // По умолчанию
          contact: '+7 (999) 123-45-67'
        };
        
        // Удаляем confirmPassword из объекта пользователя
        delete newUser.confirmPassword;
        
        // Сохраняем пользователя в AsyncStorage
        const updatedUsers = [...existingUsers, newUser];
        await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Сохраняем текущего пользователя
        await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        
        // Передаем данные родительскому компоненту
        if (setUserData) {
          setUserData(newUser);
        }
        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        }
        
        Alert.alert(
          'Регистрация успешна!',
          `Добро пожаловать в RiskDetect, ${formData.name}!`,
          [{ text: 'OK' }]
        );
        
      } catch (error) {
        console.error('Registration error:', error);
        Alert.alert('Ошибка', 'Не удалось завершить регистрацию');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  // Шаг 1: Основная информация
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Основная информация</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Имя и фамилия *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Иван Иванов"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          autoCapitalize="words"
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="example@mail.com"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Пароль *</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Не менее 6 символов"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Подтвердите пароль *</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Повторите пароль"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
        />
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}
      </View>
    </View>
  );

  // Шаг 2: Дополнительная информация
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Дополнительная информация</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Возраст *</Text>
        <TextInput
          style={[styles.input, errors.age && styles.inputError]}
          placeholder="10-18 лет"
          value={formData.age}
          onChangeText={(value) => handleInputChange('age', value)}
          keyboardType="numeric"
          maxLength={2}
        />
        {errors.age ? <Text style={styles.errorText}>{errors.age}</Text> : null}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Пол *</Text>
        <View style={styles.genderContainer}>
          {['Мужской', 'Женский', 'Не указывать'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                formData.gender === gender && styles.genderButtonSelected
              ]}
              onPress={() => handleInputChange('gender', gender)}
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
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Школа</Text>
        <TextInput
          style={styles.input}
          placeholder="Номер школы"
          value={formData.school}
          onChangeText={(value) => handleInputChange('school', value)}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Класс</Text>
        <TextInput
          style={styles.input}
          placeholder="9 класс"
          value={formData.grade}
          onChangeText={(value) => handleInputChange('grade', value)}
        />
      </View>
    </View>
  );

  // Шаг 3: Выбор роли
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Кто вы?</Text>
      <Text style={styles.stepDescription}>
        Выберите ваш статус в системе
      </Text>
      
      <View style={styles.roleContainer}>
        {[
          { 
            id: 'student', 
            title: 'Ученик', 
            description: 'Мониторинг своего состояния, прохождение тестов',
            emoji: '🎒'
          },
          { 
            id: 'parent', 
            title: 'Родитель', 
            description: 'Наблюдение за состоянием ребенка, получение уведомлений',
            emoji: '👨‍👩‍👧‍👦'
          },
          { 
            id: 'psychologist', 
            title: 'Психолог', 
            description: 'Работа с учениками, просмотр статистики, рекомендации',
            emoji: '🧠'
          }
        ].map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              formData.role === role.id && styles.roleCardSelected
            ]}
            onPress={() => handleInputChange('role', role.id)}
          >
            <Text style={styles.roleEmoji}>{role.emoji}</Text>
            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.agreementContainer}>
        <Text style={styles.agreementText}>
          Нажимая "Зарегистрироваться", вы соглашаетесь с правилами использования 
          и политикой конфиденциальности. Все данные защищены и анонимны.
        </Text>
      </View>
    </View>
  );

  // Прогресс регистрации
  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((num) => (
        <View key={num} style={styles.progressStep}>
          <View style={[
            styles.progressCircle,
            step >= num && styles.progressCircleActive
          ]}>
            <Text style={[
              styles.progressText,
              step >= num && styles.progressTextActive
            ]}>
              {num}
            </Text>
          </View>
          <Text style={styles.progressLabel}>
            {num === 1 ? 'Данные' : num === 2 ? 'Инфо' : 'Роль'}
          </Text>
        </View>
      ))}
    </View>
  );

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
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={styles.logo}>RiskDetect</Text>
            <Text style={styles.title}>Регистрация</Text>
          </View>
          
          {/* Прогресс */}
          {renderProgress()}
          
          {/* Шаги регистрации */}
          <View style={styles.formContainer}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </View>
          
          {/* Кнопки навигации */}
          <View style={styles.buttonsContainer}>
            {step > 1 && (
              <TouchableOpacity 
                style={[styles.button, styles.backButton]}
                onPress={handlePrevStep}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Назад</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.nextButton, loading && styles.buttonDisabled]}
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {step < 3 ? 'Далее' : 'Зарегистрироваться'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Ссылка на вход */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginLinkText}>
              Уже есть аккаунт? Войти
            </Text>
          </TouchableOpacity>
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
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#dfe6e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'white',
  },
  progressCircleActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#95a5a6',
  },
  progressTextActive: {
    color: 'white',
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  formContainer: {
    flex: 1,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d3436',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  genderButtonText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  roleContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dfe6e9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  roleCardSelected: {
    borderColor: '#2ecc71',
    backgroundColor: '#f9fff9',
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  agreementContainer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  agreementText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  backButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#2ecc71',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginLinkText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
});