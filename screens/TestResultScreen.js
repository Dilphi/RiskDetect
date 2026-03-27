import React, { useEffect } from 'react'; 
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar'; 

import { useTheme } from '../components/ThemeContext';
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/TestResultStyles';

export default function TestResultScreen({ route, navigation }) {
  const { result } = route.params;
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
    }
  }, [theme.dark]);

  const getLevelColor = (level) => {
    if (level?.includes(t('test_results.normal')) || level?.includes(t('test_results.low_score'))) return theme.colors.success;
    if (level?.includes(t('test_results.moderate')) || level?.includes(t('test_results.medium_score'))) return theme.colors.warning;
    return theme.colors.error;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${t('tests.result')} "${result.testTitle}": ${result.level} (${result.score}/${result.maxScore}, ${result.percentage}%)`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Переключатель языка */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <LanguageSwitcher />
        </View>

        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('tests.result')}</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Основной результат */}
        <View style={[styles.resultCard, { 
          borderTopColor: getLevelColor(result.level),
          backgroundColor: theme.colors.card 
        }]}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
              {t('tests.your_score')}
            </Text>
            <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
              {result.score}
            </Text>
            <Text style={[styles.scoreMax, { color: theme.colors.textSecondary }]}>
              {t('statistics.out_of')} {result.maxScore}
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(result.level) + '20' }]}>
              <Text style={[styles.levelText, { color: getLevelColor(result.level) }]}>
                {result.level}
              </Text>
            </View>
          </View>
          
          <View style={styles.percentageContainer}>
            <View style={[styles.percentageCircle, { borderColor: getLevelColor(result.level) }]}>
              <Text style={[styles.percentageValue, { color: getLevelColor(result.level) }]}>
                {result.percentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Описание */}
        <View style={[styles.descriptionCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>{t('statistics.interpretation')}</Text>
          <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>
            {result.description}
          </Text>
        </View>

        {/* Рекомендации */}
        <View style={[styles.recommendationsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>{t('tests.recommendations')}</Text>
          {result.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                {rec}
              </Text>
            </View>
          ))}
        </View>

        {/* Детали теста */}
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.detailsTitle, { color: theme.colors.text }]}>{t('statistics.details')}</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{t('statistics.test')}:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{result.testTitle}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{t('statistics.date')}:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {new Date(result.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Кнопки действий */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.retestButton, { 
              backgroundColor: theme.colors.info + '20',
              borderColor: theme.colors.info 
            }]}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.info} />
            <Text style={[styles.retestButtonText, { color: theme.colors.info }]}>
              {t('statistics.retake')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.diaryButton, { 
              backgroundColor: theme.colors.primary + '20',
              borderColor: theme.colors.primary 
            }]}
            onPress={() => {
              navigation.navigate('Journal', { testResult: result });
            }}
          >
            <Ionicons name="book" size={20} color={theme.colors.primary} />
            <Text style={[styles.diaryButtonText, { color: theme.colors.primary }]}>
              {t('statistics.write_to_journal')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}