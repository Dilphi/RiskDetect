import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/PsychologistStyles';

export default function PsychologistScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('chat');
  const { theme } = useTheme();

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

  const psychologists = [
    {
      id: 1,
      name: 'Иванова Мария Петровна',
      specialty: 'Клинический психолог',
      experience: '15 лет',
      education: 'МГУ, факультет психологии',
      price: 'Бесплатно',
      rating: 4.9,
      reviews: 128,
      available: true,
      image: '👩‍⚕️'
    },
    {
      id: 2,
      name: 'Петров Алексей Игоревич',
      specialty: 'Детский и подростковый психолог',
      experience: '10 лет',
      education: 'СПбГУ, психология развития',
      price: 'Бесплатно',
      rating: 4.8,
      reviews: 94,
      available: true,
      image: '👨‍⚕️'
    },
    {
      id: 3,
      name: 'Соколова Анна Викторовна',
      specialty: 'Семейный психолог',
      experience: '20 лет',
      education: 'РГГУ, психологическое консультирование',
      price: 'Бесплатно',
      rating: 4.9,
      reviews: 156,
      available: false,
      image: '👩‍⚕️'
    }
  ];

  const emergencyContacts = [
    {
      id: 1,
      title: 'Телефон доверия',
      number: '8-800-2000-122',
      description: 'Круглосуточная психологическая помощь',
      icon: 'call',
      color: theme.colors.error
    },
    {
      id: 2,
      title: 'МЧС Казахстана',
      number: '112',
      description: 'Экстренная помощь',
      icon: 'warning',
      color: theme.colors.warning
    },
    {
      id: 3,
      title: 'Линия помощи "Твоя территория"',
      number: '8-800-2000-122',
      description: 'Помощь подросткам и молодежи',
      icon: 'people',
      color: theme.colors.info
    }
  ];

  const handleCall = (number) => {
    Alert.alert(
      '📞 Звонок',
      `Позвонить по номеру ${number}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Позвонить', 
          onPress: () => Linking.openURL(`tel:${number}`) 
        }
      ]
    );
  };

  const handleChat = (psychologist) => {
    Alert.alert(
      '💬 Чат с психологом',
      `Начать чат с ${psychologist.name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Начать чат', 
          onPress: () => Alert.alert('Чат', 'Функция чата будет доступна в следующем обновлении')
        }
      ]
    );
  };

  const handleBookSession = (psychologist) => {
    Alert.alert(
      'Запись на консультацию',
      `Записаться к ${psychologist.name}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Записаться', 
          onPress: () => Alert.alert('Запись', 'Функция записи будет доступна в следующем обновлении')
        }
      ]
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>🧠 Психологическая помощь</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Профессиональная поддержка 24/7
            </Text>
          </View>

          {/* Экстренная помощь */}
          <View style={styles.emergencySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🚨 Экстренная помощь</Text>
            {emergencyContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.emergencyCard, { backgroundColor: theme.colors.card }]}
                onPress={() => handleCall(contact.number)}
                activeOpacity={0.7}
              >
                <View style={[styles.emergencyIcon, { backgroundColor: contact.color + '20' }]}>
                  <Ionicons name={contact.icon} size={24} color={contact.color} />
                </View>
                <View style={styles.emergencyInfo}>
                  <Text style={[styles.emergencyTitle, { color: theme.colors.text }]}>{contact.title}</Text>
                  <Text style={[styles.emergencyNumber, { color: contact.color }]}>{contact.number}</Text>
                  <Text style={[styles.emergencyDescription, { color: theme.colors.textSecondary }]}>
                    {contact.description}
                  </Text>
                </View>
                <Ionicons name="call" size={24} color={contact.color} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Вкладки */}
          <View style={[styles.tabs, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'chat' && [styles.tabActive, { backgroundColor: theme.colors.primary }]]}
              onPress={() => setActiveTab('chat')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'chat' ? theme.colors.white : theme.colors.textSecondary }
              ]}>
                💬 Чат с психологом
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'psychologists' && [styles.tabActive, { backgroundColor: theme.colors.primary }]]}
              onPress={() => setActiveTab('psychologists')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'psychologists' ? theme.colors.white : theme.colors.textSecondary }
              ]}>
                👥 Специалисты
              </Text>
            </TouchableOpacity>
          </View>

          {/* Контент вкладок */}
          {activeTab === 'chat' ? (
            <View style={styles.chatSection}>
              <View style={[styles.chatPlaceholder, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.lightGray} />
                <Text style={[styles.chatPlaceholderTitle, { color: theme.colors.text }]}>
                  💬 Чат с психологом
                </Text>
                <Text style={[styles.chatPlaceholderText, { color: theme.colors.textSecondary }]}>
                  Задайте вопрос нашему психологу. Мы ответим вам в ближайшее время.
                </Text>
                <TouchableOpacity 
                  style={[styles.startChatButton, { backgroundColor: theme.colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.startChatButtonText, { color: theme.colors.white }]}>Начать чат</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoCard, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="information-circle" size={24} color={theme.colors.info} />
                <Text style={[styles.infoCardText, { color: theme.colors.text }]}>
                  🔒 Чат анонимный. Все сообщения защищены и не передаются третьим лицам.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.psychologistsSection}>
              {psychologists.map((psychologist) => (
                <View key={psychologist.id} style={[styles.psychologistCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.psychologistHeader}>
                    <View style={[styles.psychologistAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={styles.psychologistAvatarText}>{psychologist.image}</Text>
                    </View>
                    <View style={styles.psychologistInfo}>
                      <Text style={[styles.psychologistName, { color: theme.colors.text }]}>{psychologist.name}</Text>
                      <Text style={[styles.psychologistSpecialty, { color: theme.colors.info }]}>
                        {psychologist.specialty}
                      </Text>
                      <View style={styles.psychologistMeta}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color={theme.colors.warning} />
                          <Text style={[styles.ratingText, { color: theme.colors.text }]}>{psychologist.rating}</Text>
                          <Text style={[styles.reviewsText, { color: theme.colors.textSecondary }]}>
                            ({psychologist.reviews})
                          </Text>
                        </View>
                        <View style={styles.experienceContainer}>
                          <Ionicons name="briefcase-outline" size={14} color={theme.colors.textSecondary} />
                          <Text style={[styles.experienceText, { color: theme.colors.textSecondary }]}>
                            {psychologist.experience}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: psychologist.available ? theme.colors.success + '20' : theme.colors.error + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: psychologist.available ? theme.colors.success : theme.colors.error }
                      ]}>
                        {psychologist.available ? '✅ Доступен' : '⏰ Занят'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.psychologistEducation, { color: theme.colors.textSecondary }]}>
                    {psychologist.education}
                  </Text>

                  <View style={styles.psychologistActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.chatButton, { backgroundColor: theme.colors.info + '20' }]}
                      onPress={() => handleChat(psychologist)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color={theme.colors.info} />
                      <Text style={[styles.chatButtonText, { color: theme.colors.info }]}>💬 Чат</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.bookButton, { backgroundColor: theme.colors.primary + '20' }]}
                      onPress={() => handleBookSession(psychologist)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                      <Text style={[styles.bookButtonText, { color: theme.colors.primary }]}>📅 Записаться</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={[styles.consultationInfo, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="heart" size={24} color={theme.colors.error} />
                <Text style={[styles.consultationInfoTitle, { color: theme.colors.text }]}>
                  ❤️ Консультации бесплатны
                </Text>
                <Text style={[styles.consultationInfoText, { color: theme.colors.textSecondary }]}>
                  Все консультации с психологами в нашем приложении проводятся бесплатно.
                  Мы заботимся о вашем психическом здоровье.
                </Text>
              </View>
            </View>
          )}

          {/* Советы по психологической поддержке */}
          <View style={[styles.tipsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>🧘 Как справиться со стрессом</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="leaf" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                🌿 Дышите глубоко: 4 сек вдох, 4 задержка, 4 выдох
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="walk" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                🚶 Сделайте короткую прогулку на свежем воздухе
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="water" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                💧 Выпейте стакан воды - это поможет успокоиться
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="people" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                🗣️ Поговорите с близким человеком о своих чувствах
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}