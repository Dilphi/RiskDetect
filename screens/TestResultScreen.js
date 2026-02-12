import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/TestResultStyles'

export default function TestResultScreen({ route, navigation }) {
  const { result } = route.params;

  const getLevelColor = (level) => {
    if (level.includes('Низкий') || level.includes('Норма')) return '#2ecc71';
    if (level.includes('Умеренный') || level.includes('Средний')) return '#f39c12';
    return '#e74c3c';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Результат теста "${result.testTitle}": ${result.level} (${result.score}/${result.maxScore}, ${result.percentage}%)`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>Результат</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#2c3e50" />
          </TouchableOpacity>
        </View>

        {/* Основной результат */}
        <View style={[styles.resultCard, { borderTopColor: getLevelColor(result.level) }]}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Ваш результат</Text>
            <Text style={styles.scoreValue}>{result.score}</Text>
            <Text style={styles.scoreMax}>из {result.maxScore}</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(result.level) + '20' }]}>
              <Text style={[styles.levelText, { color: getLevelColor(result.level) }]}>
                {result.level}
              </Text>
            </View>
          </View>
          
          <View style={styles.percentageContainer}>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageValue}>{result.percentage}%</Text>
            </View>
          </View>
        </View>

        {/* Описание */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Интерпретация</Text>
          <Text style={styles.descriptionText}>{result.description}</Text>
        </View>

        {/* Рекомендации */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>Рекомендации</Text>
          {result.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Детали теста */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Детали</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Тест:</Text>
            <Text style={styles.detailValue}>{result.testTitle}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Дата:</Text>
            <Text style={styles.detailValue}>
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
            style={[styles.actionButton, styles.retestButton]}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons name="refresh" size={20} color="#3498db" />
            <Text style={styles.retestButtonText}>Пройти ещё раз</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.diaryButton]}
            onPress={() => {
              navigation.navigate('Journal', { testResult: result });
            }}
          >
            <Ionicons name="book" size={20} color="#2ecc71" />
            <Text style={styles.diaryButtonText}>Записать в дневник</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

