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
import { useTranslation } from '../components/Translation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/PsychologistStyles';

export default function PsychologistScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('chat');
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

  const psychologists = [
    {
      id: 1,
      name: 'Иванова Мария Петровна',
      specialty: t('psychologist.clinical_psychologist'),
      experience: '15 ' + t('psychologist.years'),
      education: 'МГУ, факультет психологии',
      price: t('psychologist.free'),
      rating: 4.9,
      reviews: 128,
      available: true,
      image: '👩‍⚕️'
    },
    {
      id: 2,
      name: 'Петров Алексей Игоревич',
      specialty: t('psychologist.child_psychologist'),
      experience: '10 ' + t('psychologist.years'),
      education: 'СПбГУ, психология развития',
      price: t('psychologist.free'),
      rating: 4.8,
      reviews: 94,
      available: true,
      image: '👨‍⚕️'
    },
    {
      id: 3,
      name: 'Соколова Анна Викторовна',
      specialty: t('psychologist.family_psychologist'),
      experience: '20 ' + t('psychologist.years'),
      education: 'РГГУ, психологическое консультирование',
      price: t('psychologist.free'),
      rating: 4.9,
      reviews: 156,
      available: false,
      image: '👩‍⚕️'
    }
  ];

  const emergencyContacts = [
    {
      id: 1,
      title: t('psychologist.helpline'),
      number: '8-800-2000-122',
      description: t('psychologist.helpline_desc'),
      icon: 'call',
      color: theme.colors.error
    },
    {
      id: 2,
      title: t('psychologist.emergency_ministry'),
      number: '112',
      description: t('psychologist.emergency_desc'),
      icon: 'warning',
      color: theme.colors.warning
    },
    {
      id: 3,
      title: t('psychologist.youth_line'),
      number: '8-800-2000-122',
      description: t('psychologist.youth_desc'),
      icon: 'people',
      color: theme.colors.info
    }
  ];

  const handleCall = (number) => {
    Alert.alert(
      '📞 ' + t('psychologist.call'),
      t('psychologist.call_to', { number }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('psychologist.call'), 
          onPress: () => Linking.openURL(`tel:${number}`) 
        }
      ]
    );
  };

  const handleChat = (psychologist) => {
    Alert.alert(
      t('psychologist.chat'),
      t('psychologist.chat_with', { name: psychologist.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('psychologist.start_chat'), 
          onPress: () => Alert.alert(t('psychologist.chat'), t('psychologist.chat_not_available'))
        }
      ]
    );
  };

  const handleBookSession = (psychologist) => {
    Alert.alert(
      t('psychologist.booking_title'),
      t('psychologist.book_with', { name: psychologist.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('psychologist.book'), 
          onPress: () => Alert.alert(t('psychologist.booking_title'), t('psychologist.booking_not_available'))
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
          {/* Переключатель языка */}
          <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
            <LanguageSwitcher />
          </View>

          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>🧠 {t('psychologist.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('psychologist.subtitle')}
            </Text>
          </View>

          {/* Экстренная помощь */}
          <View style={styles.emergencySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('psychologist.emergency_section')}</Text>
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
                {t('psychologist.chat_section')}
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
                {t('psychologist.specialists_section')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Контент вкладок */}
          {activeTab === 'chat' ? (
            <View style={styles.chatSection}>
              <View style={[styles.chatPlaceholder, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.lightGray} />
                <Text style={[styles.chatPlaceholderTitle, { color: theme.colors.text }]}>
                  {t('psychologist.chat_placeholder_title')}
                </Text>
                <Text style={[styles.chatPlaceholderText, { color: theme.colors.textSecondary }]}>
                  {t('psychologist.chat_placeholder_text')}
                </Text>
                <TouchableOpacity 
                  style={[styles.startChatButton, { backgroundColor: theme.colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.startChatButtonText, { color: theme.colors.white }]}>{t('psychologist.start_chat')}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.infoCard, { backgroundColor: theme.colors.info + '20' }]}>
                <Ionicons name="information-circle" size={24} color={theme.colors.info} />
                <Text style={[styles.infoCardText, { color: theme.colors.text }]}>
                  {t('psychologist.chat_anonymous')}
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
                        {psychologist.available ? t('psychologist.available') : t('psychologist.busy')}
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
                      <Text style={[styles.chatButtonText, { color: theme.colors.info }]}>💬 {t('psychologist.chat')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.bookButton, { backgroundColor: theme.colors.primary + '20' }]}
                      onPress={() => handleBookSession(psychologist)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                      <Text style={[styles.bookButtonText, { color: theme.colors.primary }]}>📅 {t('psychologist.book')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={[styles.consultationInfo, { backgroundColor: theme.colors.card }]}>
                <Ionicons name="heart" size={24} color={theme.colors.error} />
                <Text style={[styles.consultationInfoTitle, { color: theme.colors.text }]}>
                  {t('psychologist.consultations_free')}
                </Text>
                <Text style={[styles.consultationInfoText, { color: theme.colors.textSecondary }]}>
                  {t('psychologist.consultations_free_text')}
                </Text>
              </View>
            </View>
          )}

          {/* Советы по психологической поддержке */}
          <View style={[styles.tipsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>{t('psychologist.stress_tips')}</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="leaf" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                {t('psychologist.tip1')}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="walk" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                {t('psychologist.tip2')}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="water" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                {t('psychologist.tip3')}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="people" size={20} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
                {t('psychologist.tip4')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}