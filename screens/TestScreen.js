import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles/TestStyles'

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

  useEffect(() => {
    loadCompletedTests();
  }, []);

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
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedTest?.title}</Text>
            <TouchableOpacity onPress={() => setShowTestModal(false)}>
              <Ionicons name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / selectedTest?.questions.length) * 100}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.questionCounter}>
            Вопрос {currentQuestion + 1} из {selectedTest?.questions.length}
          </Text>

          <ScrollView style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {selectedTest?.questions[currentQuestion].text}
            </Text>

            <View style={styles.optionsContainer}>
              {selectedTest?.questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQuestion] === option.score && styles.optionButtonSelected
                  ]}
                  onPress={() => selectAnswer(option.score)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[currentQuestion] === option.score && styles.optionTextSelected
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
                style={[styles.modalButton, styles.prevButton]}
                onPress={prevQuestion}
              >
                <Text style={styles.prevButtonText}>Назад</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                styles.nextButton,
                currentQuestion === 0 && { flex: 1 }
              ]}
              onPress={nextQuestion}
            >
              <Text style={styles.nextButtonText}>
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
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, styles.resultModal]}>
          <View style={styles.resultIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#2ecc71" />
          </View>
          
          <Text style={styles.resultTitle}>Тест завершен!</Text>
          <Text style={styles.resultTestName}>{testResult?.testTitle}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Ваш результат:</Text>
            <Text style={styles.scoreValue}>{testResult?.score} / {testResult?.maxScore}</Text>
            <Text style={styles.scorePercentage}>{testResult?.percentage}%</Text>
          </View>

          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Уровень:</Text>
            <Text style={[
              styles.levelValue,
              testResult?.level?.includes('Высокий') ? styles.highLevel :
              testResult?.level?.includes('Умеренный') ? styles.moderateLevel :
              styles.lowLevel
            ]}>
              {testResult?.level}
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{testResult?.description}</Text>
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Рекомендации:</Text>
            {testResult?.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Ionicons name="checkmark-circle" size={18} color="#2ecc71" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setShowResultModal(false);
              setTestResult(null);
            }}
          >
            <Text style={styles.closeButtonText}>Готово</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Психологические тесты</Text>
          <Text style={styles.subtitle}>
            Проходите тесты для оценки своего состояния и отслеживания динамики
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Ваша статистика</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedTests.length}</Text>
              <Text style={styles.statLabel}>Тестов пройдено</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {completedTests.length > 0 
                  ? Math.round(completedTests.reduce((sum, t) => sum + t.percentage, 0) / completedTests.length) 
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Средний результат</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Доступные тесты</Text>

        {tests.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={styles.testCard}
            onPress={() => startTest(test)}
          >
            <View style={styles.testHeader}>
              <View style={[styles.testIcon, { backgroundColor: '#2ecc7120' }]}>
                <Ionicons name="document-text" size={24} color="#2ecc71" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testTitle}>{test.title}</Text>
                <Text style={styles.testTime}>
                  <Ionicons name="time-outline" size={14} color="#7f8c8d" /> {test.time}
                </Text>
              </View>
            </View>
            
            <Text style={styles.testDescription}>{test.description}</Text>
            
            <View style={styles.testFooter}>
              <Text style={styles.testQuestions}>
                {test.questions.length} вопросов
              </Text>
              <View style={styles.startButton}>
                <Text style={styles.startButtonText}>Начать тест</Text>
                <Ionicons name="arrow-forward" size={16} color="#2ecc71" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {completedTests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>История тестов</Text>
            {completedTests.slice(-3).reverse().map((test, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>{test.testTitle}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(test.date).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <View style={styles.historyResult}>
                  <Text style={styles.historyScore}>
                    Результат: {test.score} / {test.maxScore}
                  </Text>
                  <Text style={[
                    styles.historyLevel,
                    test.level?.includes('Высокий') ? styles.highLevel :
                    test.level?.includes('Умеренный') ? styles.moderateLevel :
                    styles.lowLevel
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

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.loadingText}>Обработка результатов...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

