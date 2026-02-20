import React, { useEffect } from 'react'; 
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '../components/ThemeContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import styles from '../styles/EmergencyStyles';

export default function EmergencyScreen({ navigation }) {
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

  const emergencyContacts = [
    {
      id: 1,
      title: 'Телефон доверия',
      number: '8-800-2000-122',
      description: 'Круглосуточная психологическая помощь для детей и взрослых',
      icon: 'call',
      color: theme.colors.error
    },
    {
      id: 2,
      title: 'МЧС Казахстана',
      number: '112',
      description: 'Экстренная помощь при чрезвычайных ситуациях',
      icon: 'warning',
      color: theme.colors.warning
    },
    {
      id: 3,
      title: 'Линия помощи "Твоя территория"',
      number: '8-800-2000-122',
      description: 'Помощь подросткам и молодежи в кризисных ситуациях',
      icon: 'people',
      color: theme.colors.info
    },
    {
      id: 4,
      title: 'Кризисный центр для женщин',
      number: '8-800-7000-600',
      description: 'Помощь женщинам, пострадавшим от насилия',
      icon: 'woman',
      color: theme.colors.purple
    }
  ];

  const emergencyTips = [
    {
      id: 1,
      title: 'Остановитесь и подышите',
      description: 'Сделайте глубокий вдох на 4 секунды, задержите дыхание на 4 секунды, медленно выдохните на 4 секунды.',
      icon: 'leaf'
    },
    {
      id: 2,
      title: 'Заземлитесь',
      description: 'Назовите 5 вещей, которые вы видите, 4 вещи, которые вы можете потрогать, 3 звука, которые вы слышите, 2 запаха, 1 вкус.',
      icon: 'body'
    },
    {
      id: 3,
      title: 'Не оставайтесь в одиночестве',
      description: 'Позвоните близкому человеку или в службу поддержки. Вам не обязательно объяснять причину звонка.',
      icon: 'people'
    }
  ];

  const handleCall = (number) => {
    Alert.alert(
      'Звонок',
      `Позвонить по номеру ${number}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Позвонить', 
          onPress: () => Linking.openURL(`tel:${number.replace(/-/g, '')}`) 
        }
      ]
    );
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Ionicons name="alert-circle" size={60} color={theme.colors.error} />
          <Text style={[styles.title, { color: theme.colors.error }]}>
            Экстренная помощь
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Если вам или кому-то рядом нужна помощь, не оставайтесь в одиночестве
          </Text>
        </View>

        {/* Телефоны экстренной помощи */}
        <View style={styles.emergencySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Круглосуточные телефоны
          </Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={[styles.emergencyCard, { backgroundColor: theme.colors.card }]}
              onPress={() => handleCall(contact.number)}
              activeOpacity={0.7}
            >
              <View style={[styles.emergencyIcon, { backgroundColor: contact.color + '20' }]}>
                <Ionicons name={contact.icon} size={28} color={contact.color} />
              </View>
              <View style={styles.emergencyInfo}>
                <Text style={[styles.emergencyTitle, { color: theme.colors.text }]}>
                  {contact.title}
                </Text>
                <Text style={[styles.emergencyNumber, { color: contact.color }]}>
                  {contact.number}
                </Text>
                <Text style={[styles.emergencyDescription, { color: theme.colors.textSecondary }]}>
                  {contact.description}
                </Text>
              </View>
              <Ionicons name="call" size={24} color={contact.color} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Что делать в кризисной ситуации */}
        <View style={styles.tipsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Что делать прямо сейчас
          </Text>
          {emergencyTips.map((tip) => (
            <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.tipHeader}>
                <View style={[styles.tipIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name={tip.icon} size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.tipTitle, { color: theme.colors.text }]}>
                  {tip.title}
                </Text>
              </View>
              <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>
                {tip.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Важная информация */}
        <View style={[styles.importantCard, { backgroundColor: theme.colors.info + '20' }]}>
          <Ionicons name="information-circle" size={24} color={theme.colors.info} />
          <Text style={[styles.importantText, { color: theme.colors.text }]}>
            Все звонки бесплатны и анонимны. Помощь доступна 24/7. 
            Не стесняйтесь обращаться за помощью - это признак силы, а не слабости.
          </Text>
        </View>

        {/* Кнопка чата */}
        <TouchableOpacity 
          style={[styles.chatButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Psychologist')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={24} color={theme.colors.white} />
          <Text style={[styles.chatButtonText, { color: theme.colors.white }]}>
            Чат с психологом
          </Text>
        </TouchableOpacity>

        {/* Дополнительный отступ снизу */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </ScreenWrapper>
  );
}