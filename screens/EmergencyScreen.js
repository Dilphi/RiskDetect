import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/EmergencyStyles';

export default function EmergencyScreen({ navigation }) {
  const emergencyContacts = [
    {
      id: 1,
      title: 'Телефон доверия',
      number: '8-800-2000-122',
      description: 'Круглосуточная психологическая помощь для детей и взрослых',
      icon: 'call',
      color: '#e74c3c'
    },
    {
      id: 2,
      title: 'МЧС Казахстана',
      number: '112',
      description: 'Экстренная помощь при чрезвычайных ситуациях',
      icon: 'warning',
      color: '#f39c12'
    },
    {
      id: 3,
      title: 'Линия помощи "Твоя территория"',
      number: '8-800-2000-122',
      description: 'Помощь подросткам и молодежи в кризисных ситуациях',
      icon: 'people',
      color: '#3498db'
    },
    {
      id: 4,
      title: 'Кризисный центр для женщин',
      number: '8-800-7000-600',
      description: 'Помощь женщинам, пострадавшим от насилия',
      icon: 'woman',
      color: '#9b59b6'
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
      '📞 Звонок',
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Ionicons name="alert-circle" size={60} color="#e74c3c" />
          <Text style={styles.title}>🚨 Экстренная помощь</Text>
          <Text style={styles.subtitle}>
            Если вам или кому-то рядом нужна помощь, не оставайтесь в одиночестве
          </Text>
        </View>

        {/* Телефоны экстренной помощи */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>📞 Круглосуточные телефоны</Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.emergencyCard}
              onPress={() => handleCall(contact.number)}
              activeOpacity={0.7}
            >
              <View style={[styles.emergencyIcon, { backgroundColor: contact.color + '20' }]}>
                <Ionicons name={contact.icon} size={28} color={contact.color} />
              </View>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>{contact.title}</Text>
                <Text style={[styles.emergencyNumber, { color: contact.color }]}>
                  {contact.number}
                </Text>
                <Text style={styles.emergencyDescription}>{contact.description}</Text>
              </View>
              <Ionicons name="call" size={24} color={contact.color} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Что делать в кризисной ситуации */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>🆘 Что делать прямо сейчас</Text>
          {emergencyTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={[styles.tipIcon, { backgroundColor: '#2ecc7120' }]}>
                  <Ionicons name={tip.icon} size={24} color="#2ecc71" />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          ))}
        </View>

        {/* Важная информация */}
        <View style={styles.importantCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <Text style={styles.importantText}>
            Все звонки бесплатны и анонимны. Помощь доступна 24/7. 
            Не стесняйтесь обращаться за помощью - это признак силы, а не слабости.
          </Text>
        </View>

        {/* Кнопка чата */}
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('Psychologist')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={24} color="white" />
          <Text style={styles.chatButtonText}>Чат с психологом</Text>
        </TouchableOpacity>

        {/* Дополнительный отступ снизу */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}