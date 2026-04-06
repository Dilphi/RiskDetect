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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/TestStyles';
import api from '../services/api'

// Реальные психологические тесты с локализацией
const getTests = (t) => [
  {
    id: 1,
    title: t('tests.beck_depression'),
    description: t('tests.beck_description'),
    questions: [
      {
        id: 1,
        text: t('tests.question1_mood'),
        options: [
          { text: t('tests.q1_opt1'), score: 0 },
          { text: t('tests.q1_opt2'), score: 1 },
          { text: t('tests.q1_opt3'), score: 2 },
          { text: t('tests.q1_opt4'), score: 3 }
        ]
      },
      {
        id: 2,
        text: t('tests.question2_future'),
        options: [
          { text: t('tests.q2_opt1'), score: 0 },
          { text: t('tests.q2_opt2'), score: 1 },
          { text: t('tests.q2_opt3'), score: 2 },
          { text: t('tests.q2_opt4'), score: 3 }
        ]
      },
      {
        id: 3,
        text: t('tests.question3_self_esteem'),
        options: [
          { text: t('tests.q3_opt1'), score: 0 },
          { text: t('tests.q3_opt2'), score: 1 },
          { text: t('tests.q3_opt3'), score: 2 },
          { text: t('tests.q3_opt4'), score: 3 }
        ]
      },
      {
        id: 4,
        text: t('tests.question4_productivity'),
        options: [
          { text: t('tests.q4_opt1'), score: 0 },
          { text: t('tests.q4_opt2'), score: 1 },
          { text: t('tests.q4_opt3'), score: 2 },
          { text: t('tests.q4_opt4'), score: 3 }
        ]
      },
      {
        id: 5,
        text: t('tests.question5_sleep'),
        options: [
          { text: t('tests.q5_opt1'), score: 0 },
          { text: t('tests.q5_opt2'), score: 1 },
          { text: t('tests.q5_opt3'), score: 2 },
          { text: t('tests.q5_opt4'), score: 3 }
        ]
      }
    ],
    time: t('tests.time_5_10')
  },
  {
    id: 2,
    title: t('tests.spielberger_anxiety'),
    description: t('tests.spielberger_description'),
    questions: [
      {
        id: 1,
        text: t('tests.anxiety_q1'),
        options: [
          { text: t('tests.anxiety_opt1'), score: 3 },
          { text: t('tests.anxiety_opt2'), score: 2 },
          { text: t('tests.anxiety_opt3'), score: 1 },
          { text: t('tests.anxiety_opt4'), score: 0 }
        ]
      },
      {
        id: 2,
        text: t('tests.anxiety_q2'),
        options: [
          { text: t('tests.anxiety_opt1'), score: 0 },
          { text: t('tests.anxiety_opt2'), score: 1 },
          { text: t('tests.anxiety_opt3'), score: 2 },
          { text: t('tests.anxiety_opt4'), score: 3 }
        ]
      },
      {
        id: 3,
        text: t('tests.anxiety_q3'),
        options: [
          { text: t('tests.anxiety_opt1'), score: 0 },
          { text: t('tests.anxiety_opt2'), score: 1 },
          { text: t('tests.anxiety_opt3'), score: 2 },
          { text: t('tests.anxiety_opt4'), score: 3 }
        ]
      },
      {
        id: 4,
        text: t('tests.anxiety_q4'),
        options: [
          { text: t('tests.anxiety_opt1'), score: 0 },
          { text: t('tests.anxiety_opt2'), score: 1 },
          { text: t('tests.anxiety_opt3'), score: 2 },
          { text: t('tests.anxiety_opt4'), score: 3 }
        ]
      },
      {
        id: 5,
        text: t('tests.anxiety_q5'),
        options: [
          { text: t('tests.anxiety_opt1'), score: 3 },
          { text: t('tests.anxiety_opt2'), score: 2 },
          { text: t('tests.anxiety_opt3'), score: 1 },
          { text: t('tests.anxiety_opt4'), score: 0 }
        ]
      }
    ],
    time: t('tests.time_5')
  },
  {
    id: 3,
    title: t('tests.stress_assessment'),
    description: t('tests.stress_description'),
    questions: [
      {
        id: 1,
        text: t('tests.stress_q1'),
        options: [
          { text: t('tests.stress_opt1'), score: 0 },
          { text: t('tests.stress_opt2'), score: 1 },
          { text: t('tests.stress_opt3'), score: 2 },
          { text: t('tests.stress_opt4'), score: 3 },
          { text: t('tests.stress_opt5'), score: 4 }
        ]
      },
      {
        id: 2,
        text: t('tests.stress_q2'),
        options: [
          { text: t('tests.stress_opt1'), score: 4 },
          { text: t('tests.stress_opt2'), score: 3 },
          { text: t('tests.stress_opt3'), score: 2 },
          { text: t('tests.stress_opt4'), score: 1 },
          { text: t('tests.stress_opt5'), score: 0 }
        ]
      },
      {
        id: 3,
        text: t('tests.stress_q3'),
        options: [
          { text: t('tests.stress_opt1'), score: 4 },
          { text: t('tests.stress_opt2'), score: 3 },
          { text: t('tests.stress_opt3'), score: 2 },
          { text: t('tests.stress_opt4'), score: 1 },
          { text: t('tests.stress_opt5'), score: 0 }
        ]
      },
      {
        id: 4,
        text: t('tests.stress_q4'),
        options: [
          { text: t('tests.stress_opt1'), score: 0 },
          { text: t('tests.stress_opt2'), score: 1 },
          { text: t('tests.stress_opt3'), score: 2 },
          { text: t('tests.stress_opt4'), score: 3 },
          { text: t('tests.stress_opt5'), score: 4 }
        ]
      }
    ],
    time: t('tests.time_3_5')
  },
  {
    id: 4,
    title: t('tests.quality_of_life'),
    description: t('tests.quality_description'),
    questions: [
      {
        id: 1,
        text: t('tests.quality_q1'),
        options: [
          { text: t('tests.quality_opt1'), score: 4 },
          { text: t('tests.quality_opt2'), score: 3 },
          { text: t('tests.quality_opt3'), score: 2 },
          { text: t('tests.quality_opt4'), score: 1 },
          { text: t('tests.quality_opt5'), score: 0 }
        ]
      },
      {
        id: 2,
        text: t('tests.quality_q2'),
        options: [
          { text: t('tests.quality_opt1'), score: 4 },
          { text: t('tests.quality_opt2'), score: 3 },
          { text: t('tests.quality_opt3'), score: 2 },
          { text: t('tests.quality_opt4'), score: 1 },
          { text: t('tests.quality_opt5'), score: 0 }
        ]
      },
      {
        id: 3,
        text: t('tests.quality_q3'),
        options: [
          { text: t('tests.quality_opt1'), score: 4 },
          { text: t('tests.quality_opt2'), score: 3 },
          { text: t('tests.quality_opt3'), score: 2 },
          { text: t('tests.quality_opt4'), score: 1 },
          { text: t('tests.quality_opt5'), score: 0 }
        ]
      },
      {
        id: 4,
        text: t('tests.quality_q4'),
        options: [
          { text: t('tests.quality_opt1'), score: 4 },
          { text: t('tests.quality_opt2'), score: 3 },
          { text: t('tests.quality_opt3'), score: 2 },
          { text: t('tests.quality_opt4'), score: 1 },
          { text: t('tests.quality_opt5'), score: 0 }
        ]
      }
    ],
    time: t('tests.time_3')
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
  const { t } = useTranslation();

  const tests = getTests(t);

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
      const response = await api.getTests();
      setCompletedTests(response.tests || []);
    } catch (error) {
      console.log('Нет пройденных тестов');
      setCompletedTests([]);
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
      Alert.alert(t('common.error'), t('tests.select_answer'));
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
    
    if (selectedTest.id === 1) {
      if (totalScore <= 4) {
        level = t('tests.normal');
        description = t('tests.normal_desc');
        recommendations = [t('tests.normal_rec1'), t('tests.normal_rec2'), t('tests.normal_rec3')];
      } else if (totalScore <= 9) {
        level = t('tests.mild');
        description = t('tests.mild_desc');
        recommendations = [t('tests.mild_rec1'), t('tests.mild_rec2'), t('tests.mild_rec3')];
      } else if (totalScore <= 14) {
        level = t('tests.moderate');
        description = t('tests.moderate_desc');
        recommendations = [t('tests.moderate_rec1'), t('tests.moderate_rec2'), t('tests.moderate_rec3')];
      } else {
        level = t('tests.severe');
        description = t('tests.severe_desc');
        recommendations = [t('tests.severe_rec1'), t('tests.severe_rec2'), t('tests.severe_rec3')];
      }
    } else if (selectedTest.id === 2) {
      if (totalScore <= 5) {
        level = t('tests.low_anxiety');
        description = t('tests.low_anxiety_desc');
        recommendations = [t('tests.low_anxiety_rec1'), t('tests.low_anxiety_rec2')];
      } else if (totalScore <= 10) {
        level = t('tests.moderate_anxiety');
        description = t('tests.moderate_anxiety_desc');
        recommendations = [t('tests.moderate_anxiety_rec1'), t('tests.moderate_anxiety_rec2'), t('tests.moderate_anxiety_rec3')];
      } else {
        level = t('tests.high_anxiety');
        description = t('tests.high_anxiety_desc');
        recommendations = [t('tests.high_anxiety_rec1'), t('tests.high_anxiety_rec2'), t('tests.high_anxiety_rec3')];
      }
    } else {
      if (percentage >= 70) {
        level = t('tests.high_score');
        description = t('tests.high_score_desc');
        recommendations = [t('tests.high_score_rec1'), t('tests.high_score_rec2')];
      } else if (percentage >= 40) {
        level = t('tests.medium_score');
        description = t('tests.medium_score_desc');
        recommendations = [t('tests.medium_score_rec1'), t('tests.medium_score_rec2')];
      } else {
        level = t('tests.low_score');
        description = t('tests.low_score_desc');
        recommendations = [t('tests.low_score_rec1'), t('tests.low_score_rec2')];
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

    try {
      await api.saveTestResult(result);
      await loadCompletedTests(); // Обновляем список
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
            {t('tests.question_counter', { current: currentQuestion + 1, total: selectedTest?.questions.length })}
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
                <Text style={[styles.prevButtonText, { color: theme.colors.textSecondary }]}>{t('tests.back')}</Text>
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
                {currentQuestion === selectedTest?.questions.length - 1 ? t('tests.finish') : t('tests.next')}
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
          
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{t('tests.test_completed')}</Text>
          <Text style={[styles.resultTestName, { color: theme.colors.textSecondary }]}>{testResult?.testTitle}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>{t('tests.your_score')}</Text>
            <Text style={[styles.scoreValue, { color: theme.colors.text }]}>{testResult?.score} / {testResult?.maxScore}</Text>
            <Text style={[styles.scorePercentage, { color: theme.colors.success }]}>{testResult?.percentage}%</Text>
          </View>

          <View style={styles.levelContainer}>
            <Text style={[styles.levelLabel, { color: theme.colors.textSecondary }]}>{t('tests.level')}</Text>
            <Text style={[
              styles.levelValue,
              testResult?.level?.includes(t('tests.high_score')) ? { color: theme.colors.error } :
              testResult?.level?.includes(t('tests.moderate')) ? { color: theme.colors.warning } :
              { color: theme.colors.success }
            ]}>
              {testResult?.level}
            </Text>
          </View>

          <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.descriptionText, { color: theme.colors.text }]}>{testResult?.description}</Text>
          </View>

          <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>{t('tests.recommendations')}</Text>
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
            <Text style={[styles.closeButtonText, { color: theme.colors.white }]}>{t('tests.done')}</Text>
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
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>{t('tests.processing')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Переключатель языка */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <LanguageSwitcher />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('tests.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('tests.subtitle')}
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>{t('tests.your_stats')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{completedTests.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('tests.tests_taken')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {completedTests.length > 0 
                  ? Math.round(completedTests.reduce((sum, t) => sum + t.percentage, 0) / completedTests.length) 
                  : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('tests.avg_result')}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('tests.available_tests')}</Text>

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
                {test.questions.length} {t('tests.questions')}
              </Text>
              <View style={styles.startButton}>
                <Text style={[styles.startButtonText, { color: theme.colors.primary }]}>{t('tests.start')}</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {completedTests.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('tests.history')}</Text>
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
                    {t('tests.result_label', { score: test.score, max: test.maxScore })}
                  </Text>
                  <Text style={[
                    styles.historyLevel,
                    test.level?.includes(t('tests.high_score')) ? { color: theme.colors.error } :
                    test.level?.includes(t('tests.moderate')) ? { color: theme.colors.warning } :
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