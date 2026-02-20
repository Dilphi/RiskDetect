import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/TestStyles';

// Реальные психологические тесты
const tests = [
  {
    id: 1,
    title: 'Шкала депрессии Бека',
    description: 'Оценка наличия и выраженности депрессивных симптомов',
    questions: [
      {
        id: 1,
        text: 'Как вы оцениваете свое настроение?',
        options: [
          { text: 'Я не чувствую грусти', score: 0 },
          { text: 'Я иногда чувствую грусть', score: 1 },
          { text: 'Я все время чувствую грусть', score: 2 },
          { text: 'Я так несчастлив, что не могу этого вынести', score: 3 }
        ]
      },
      {
        id: 2,
        text: 'Как вы относитесь к будущему?',
        options: [
          { text: 'С оптимизмом', score: 0 },
          { text: 'Иногда кажется, что ничего хорошего не будет', score: 1 },
          { text: 'Я чувствую, что не могу преодолеть трудности', score: 2 },
          { text: 'Будущее безнадежно', score: 3 }
        ]
      },
      {
        id: 3,
        text: 'Оцените свою самооценку',
        options: [
          { text: 'Я чувствую себя полноценным человеком', score: 0 },
          { text: 'Я чувствую себя неудачником', score: 1 },
          { text: 'Я разочарован в себе', score: 2 },
          { text: 'Я ненавижу себя', score: 3 }
        ]
      },
      {
        id: 4,
        text: 'Как вы оцениваете свою работоспособность?',
        options: [
          { text: 'Я работаю как обычно', score: 0 },
          { text: 'Мне трудно начинать работу', score: 1 },
          { text: 'Мне приходится заставлять себя работать', score: 2 },
          { text: 'Я вообще не могу работать', score: 3 }
        ]
      },
      {
        id: 5,
        text: 'Как вы оцениваете свой сон?',
        options: [
          { text: 'Я сплю хорошо', score: 0 },
          { text: 'Я сплю беспокойно', score: 1 },
          { text: 'Я просыпаюсь на 1-2 часа раньше', score: 2 },
          { text: 'Я просыпаюсь на несколько часов раньше', score: 3 }
        ]
      }
    ],
    time: '5-10 мин'
  },
  {
    id: 2,
    title: 'Шкала тревоги Спилбергера',
    description: 'Оценка уровня ситуативной и личностной тревожности',
    questions: [
      {
        id: 1,
        text: 'Я чувствую себя спокойно',
        options: [
          { text: 'Нет, это не так', score: 3 },
          { text: 'Пожалуй, так', score: 2 },
          { text: 'Верно', score: 1 },
          { text: 'Совершенно верно', score: 0 }
        ]
      },
      {
        id: 2,
        text: 'Я напряжен',
        options: [
          { text: 'Нет, это не так', score: 0 },
          { text: 'Пожалуй, так', score: 1 },
          { text: 'Верно', score: 2 },
          { text: 'Совершенно верно', score: 3 }
        ]
      },
      {
        id: 3,
        text: 'Я расстроен',
        options: [
          { text: 'Нет, это не так', score: 0 },
          { text: 'Пожалуй, так', score: 1 },
          { text: 'Верно', score: 2 },
          { text: 'Совершенно верно', score: 3 }
        ]
      },
      {
        id: 4,
        text: 'Я нервничаю',
        options: [
          { text: 'Нет, это не так', score: 0 },
          { text: 'Пожалуй, так', score: 1 },
          { text: 'Верно', score: 2 },
          { text: 'Совершенно верно', score: 3 }
        ]
      },
      {
        id: 5,
        text: 'Я чувствую себя отдохнувшим',
        options: [
          { text: 'Нет, это не так', score: 3 },
          { text: 'Пожалуй, так', score: 2 },
          { text: 'Верно', score: 1 },
          { text: 'Совершенно верно', score: 0 }
        ]
      }
    ],
    time: '5 мин'
  },
  {
    id: 3,
    title: 'Оценка уровня стресса',
    description: 'Оценка психологического стресса за последний месяц',
    questions: [
      {
        id: 1,
        text: 'Как часто вы чувствуете, что не можете контролировать важные вещи в своей жизни?',
        options: [
          { text: 'Никогда', score: 0 },
          { text: 'Почти никогда', score: 1 },
          { text: 'Иногда', score: 2 },
          { text: 'Довольно часто', score: 3 },
          { text: 'Очень часто', score: 4 }
        ]
      },
      {
        id: 2,
        text: 'Как часто вы чувствуете уверенность в своих способностях решать личные проблемы?',
        options: [
          { text: 'Никогда', score: 4 },
          { text: 'Почти никогда', score: 3 },
          { text: 'Иногда', score: 2 },
          { text: 'Довольно часто', score: 1 },
          { text: 'Очень часто', score: 0 }
        ]
      },
      {
        id: 3,
        text: 'Как часто вы чувствуете, что все идет так, как вы хотите?',
        options: [
          { text: 'Никогда', score: 4 },
          { text: 'Почти никогда', score: 3 },
          { text: 'Иногда', score: 2 },
          { text: 'Довольно часто', score: 1 },
          { text: 'Очень часто', score: 0 }
        ]
      },
      {
        id: 4,
        text: 'Как часто вы чувствуете, что трудности накапливаются так сильно, что вы не можете их преодолеть?',
        options: [
          { text: 'Никогда', score: 0 },
          { text: 'Почти никогда', score: 1 },
          { text: 'Иногда', score: 2 },
          { text: 'Довольно часто', score: 3 },
          { text: 'Очень часто', score: 4 }
        ]
      }
    ],
    time: '3-5 мин'
  },
  {
    id: 4,
    title: 'Оценка качества жизни',
    description: 'Оценка удовлетворенности различными сферами жизни',
    questions: [
      {
        id: 1,
        text: 'Как вы оцениваете свое физическое здоровье?',
        options: [
          { text: 'Отлично', score: 4 },
          { text: 'Хорошо', score: 3 },
          { text: 'Удовлетворительно', score: 2 },
          { text: 'Плохо', score: 1 },
          { text: 'Очень плохо', score: 0 }
        ]
      },
      {
        id: 2,
        text: 'Как вы оцениваете свое психологическое состояние?',
        options: [
          { text: 'Отлично', score: 4 },
          { text: 'Хорошо', score: 3 },
          { text: 'Удовлетворительно', score: 2 },
          { text: 'Плохо', score: 1 },
          { text: 'Очень плохо', score: 0 }
        ]
      },
      {
        id: 3,
        text: 'Как вы оцениваете свои социальные связи?',
        options: [
          { text: 'Отлично', score: 4 },
          { text: 'Хорошо', score: 3 },
          { text: 'Удовлетворительно', score: 2 },
          { text: 'Плохо', score: 1 },
          { text: 'Очень плохо', score: 0 }
        ]
      },
      {
        id: 4,
        text: 'Как вы оцениваете свою рабочую/учебную продуктивность?',
        options: [
          { text: 'Отлично', score: 4 },
          { text: 'Хорошо', score: 3 },
          { text: 'Удовлетворительно', score: 2 },
          { text: 'Плохо', score: 1 },
          { text: 'Очень плохо', score: 0 }
        ]
      }
    ],
    time: '3 мин'
  }
];

export default function TestScreen({ navigation, userData }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme(); 

  useEffect(() => {
    loadCompletedTests();

    if (Platform.OS === 'android') {
      const configureNavigationBar = async () => {
        try {
          await NavigationBar.setButtonStyleAsync(
            theme.dark ? 'light' : 'dark'
          );
        } catch (error) {
          console.error('Error configuring navigation bar:', error);
        }
      };

      configureNavigationBar();

      return () => {
        NavigationBar.setButtonStyleAsync('dark');
      };
    }
  }, [theme.dark]);


  const loadCompletedTests = async () => {
    try {
      const testsJson = await AsyncStorage.getItem(`tests_${userData?.id}`);
      setCompletedTests(testsJson ? JSON.parse(testsJson) : []);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const startTest = (test) => {
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowTestModal(true);
  };

  const selectAnswer = (score) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (answers[currentQuestion] === undefined) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите ответ');
      return;
    }

    if (currentQuestion < selectedTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = async () => {
    setLoading(true);
    
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    const maxScore = selectedTest.questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;
    
    let level, description, recommendations;
    
    if (selectedTest.id === 1) { // Шкала депрессии
      if (totalScore <= 4) {
        level = 'Норма';
        description = 'У вас нет признаков депрессии. Вы хорошо справляетесь с эмоциональными нагрузками.';
        recommendations = ['Продолжайте поддерживать здоровый образ жизни', 'Регулярно занимайтесь физической активностью', 'Сохраняйте социальные контакты'];
      } else if (totalScore <= 9) {
        level = 'Легкая депрессия';
        description = 'У вас наблюдаются легкие признаки депрессии. Рекомендуется обратить внимание на свое состояние.';
        recommendations = ['Ведите дневник настроения', 'Увеличьте физическую активность', 'Практикуйте техники релаксации'];
      } else if (totalScore <= 14) {
        level = 'Умеренная депрессия';
        description = 'У вас наблюдаются умеренные признаки депрессии. Рекомендуется консультация психолога.';
        recommendations = ['Обратитесь к психологу', 'Регулярно отслеживайте настроение', 'Не изолируйтесь от близких'];
      } else {
        level = 'Высокий уровень депрессии';
        description = 'У вас наблюдаются серьезные признаки депрессии. Настоятельно рекомендуется обратиться к специалисту.';
        recommendations = ['Немедленно обратитесь к психологу', 'Поделитесь своими чувствами с близкими', 'Не оставайтесь в одиночестве'];
      }
    } else if (selectedTest.id === 2) { // Тревога
      if (totalScore <= 5) {
        level = 'Низкий уровень тревоги';
        description = 'У вас низкий уровень тревожности. Вы хорошо справляетесь со стрессовыми ситуациями.';
        recommendations = ['Продолжайте использовать эффективные стратегии совладания', 'Поддерживайте здоровый баланс работы и отдыха'];
      } else if (totalScore <= 10) {
        level = 'Умеренный уровень тревоги';
        description = 'У вас умеренный уровень тревожности. Это нормальная реакция на стресс.';
        recommendations = ['Практикуйте дыхательные упражнения', 'Используйте техники заземления', 'Регулярно отдыхайте'];
      } else {
        level = 'Высокий уровень тревоги';
        description = 'У вас высокий уровень тревожности. Рекомендуется работа с психологом.';
        recommendations = ['Обратитесь к психологу', 'Изучите техники управления тревогой', 'Избегайте стимуляторов'];
      }
    } else {
      // Общая интерпретация для других тестов
      if (percentage >= 70) {
        level = 'Высокий показатель';
        description = 'У вас высокие показатели по данному тесту.';
        recommendations = ['Продолжайте следить за своим состоянием', 'Используйте полученные результаты для самопознания'];
      } else if (percentage >= 40) {
        level = 'Средний показатель';
        description = 'У вас средние показатели по данному тесту.';
        recommendations = ['Обратите внимание на области, требующие улучшения', 'Поставьте цели для личностного роста'];
      } else {
        level = 'Низкий показатель';
        description = 'У вас низкие показатели по данному тесту. Это может указывать на необходимость обратить внимание на эту сферу.';
        recommendations = ['Работайте над улучшением в этой области', 'Обратитесь за поддержкой к специалисту'];
      }
    }

    const result = {
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      date: new Date().toISOString(),
      score: totalScore,
      maxScore: maxScore,
      percentage: Math.round(percentage),
      level: level,
      description: description,
      recommendations: recommendations
    };

    setTestResult(result);
    setShowTestModal(false);
    setShowResultModal(true);

    // Сохраняем результат
    try {
      const testsJson = await AsyncStorage.getItem(`tests_${userData?.id}`);
      let tests = testsJson ? JSON.parse(testsJson) : [];
      tests.push(result);
      await AsyncStorage.setItem(`tests_${userData?.id}`, JSON.stringify(tests));
      setCompletedTests(tests);
    } catch (error) {
      console.error('Error saving test result:', error);
    }

    setLoading(false);
  };

  const renderTestModal = () => (
    <Modal
      visible={showTestModal}
      animationType="slide"
      transparent={true}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedTest?.title}</Text>
            <TouchableOpacity onPress={() => setShowTestModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.lightGray} />
            </TouchableOpacity>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentQuestion + 1) / selectedTest?.questions.length) * 100}%`,
                  backgroundColor: theme.colors.primary 
                }
              ]} 
            />
          </View>
          
          <Text style={[styles.questionCounter, { color: theme.colors.textSecondary }]}>
            Вопрос {currentQuestion + 1} из {selectedTest?.questions.length}
          </Text>

          <ScrollView style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              {selectedTest?.questions[currentQuestion].text}
            </Text>

            <View style={styles.optionsContainer}>
              {selectedTest?.questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQuestion] === option.score && styles.optionButtonSelected,
                    { 
                      backgroundColor: answers[currentQuestion] === option.score ? theme.colors.primary : theme.colors.background,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={() => selectAnswer(option.score)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: answers[currentQuestion] === option.score ? theme.colors.white : theme.colors.text }
                  ]}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            {currentQuestion > 0 && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.prevButton, { borderColor: theme.colors.border }]}
                onPress={prevQuestion}
              >
                <Text style={[styles.prevButtonText, { color: theme.colors.textSecondary }]}>Назад</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                styles.nextButton,
                { backgroundColor: theme.colors.primary },
                currentQuestion === 0 && { flex: 1 }
              ]}
              onPress={nextQuestion}
            >
              <Text style={[styles.nextButtonText, { color: theme.colors.white }]}>
                {currentQuestion === selectedTest?.questions.length - 1 ? 'Завершить' : 'Далее'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderResultModal = () => (
    <Modal
      visible={showResultModal}
      animationType="slide"
      transparent={true}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.modalContent, styles.resultModal, { backgroundColor: theme.colors.card }]}>
          <View style={styles.resultIcon}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
          </View>
          
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Тест завершен!</Text>
          <Text style={[styles.resultTestName, { color: theme.colors.textSecondary }]}>{testResult?.testTitle}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>Ваш результат:</Text>
            <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{testResult?.score} / {testResult?.maxScore}</Text>
            <Text style={[styles.scorePercentage, { color: theme.colors.success }]}>{testResult?.percentage}%</Text>
          </View>

          <View style={styles.levelContainer}>
            <Text style={[styles.levelLabel, { color: theme.colors.textSecondary }]}>Уровень:</Text>
            <Text style={[
              styles.levelValue,
              testResult?.level?.includes('Высокий') ? { color: theme.colors.error } :
              testResult?.level?.includes('Умеренный') ? { color: theme.colors.warning } :
              { color: theme.colors.success }
            ]}>
              {testResult?.level}
            </Text>
          </View>

          <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.descriptionText, { color: theme.colors.text }]}>{testResult?.description}</Text>
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>Рекомендации:</Text>
            {testResult?.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>{rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setShowResultModal(false);
              setTestResult(null);
            }}
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.white }]}>Готово</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.overlay }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Обработка результатов...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Психологические тесты</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Проходите тесты для оценки своего состояния и отслеживания динамики
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Ваша статистика</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{completedTests.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Тестов пройдено</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {completedTests.length > 0 
                  ? Math.round(completedTests.reduce((sum, t) => sum + t.percentage, 0) / completedTests.length) 
                  : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Средний результат</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Доступные тесты</Text>

        {tests.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={[styles.testCard, { backgroundColor: theme.colors.card }]}
            onPress={() => startTest(test)}
          >
            <View style={styles.testHeader}>
              <View style={[styles.testIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="document-text" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.testInfo}>
                <Text style={[styles.testTitle, { color: theme.colors.text }]}>{test.title}</Text>
                <Text style={[styles.testTime, { color: theme.colors.textSecondary }]}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} /> {test.time}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.testDescription, { color: theme.colors.textSecondary }]}>{test.description}</Text>
            
            <View style={styles.testFooter}>
              <Text style={[styles.testQuestions, { color: theme.colors.textSecondary }]}>
                {test.questions.length} вопросов
              </Text>
              <View style={styles.startButton}>
                <Text style={[styles.startButtonText, { color: theme.colors.primary }]}>Начать тест</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {completedTests.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>История тестов</Text>
            {completedTests.slice(-3).reverse().map((test, index) => (
              <View key={index} style={[styles.historyCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{test.testTitle}</Text>
                  <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
                    {new Date(test.date).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <View style={styles.historyResult}>
                  <Text style={[styles.historyScore, { color: theme.colors.textSecondary }]}>
                    Результат: {test.score} / {test.maxScore}
                  </Text>
                  <Text style={[
                    styles.historyLevel,
                    test.level?.includes('Высокий') ? { color: theme.colors.error } :
                    test.level?.includes('Умеренный') ? { color: theme.colors.warning } :
                    { color: theme.colors.success }
                  ]}>
                    {test.level}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {renderTestModal()}
      {renderResultModal()}
    </ScreenWrapper>
  );
}