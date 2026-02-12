import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import styles from '../styles/PsychologistStyles'

export default function PsychologistScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('chat');

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
      icon: 'call'
    },
    {
      id: 2,
      title: 'МЧС России',
      number: '112',
      description: 'Экстренная помощь',
      icon: 'warning'
    },
    {
      id: 3,
      title: 'Линия помощи "Твоя территория"',
      number: '8-800-2000-122',
      description: 'Помощь подросткам и молодежи',
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
          onPress: () => Linking.openURL(`tel:${number}`) 
        }
      ]
    );
  };

  const handleChat = (psychologist) => {
    Alert.alert(
      'Чат с психологом',
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Психологическая помощь</Text>
          <Text style={styles.subtitle}>
            Профессиональная поддержка 24/7
          </Text>
        </View>

        {/* Экстренная помощь */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>🚨 Экстренная помощь</Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.emergencyCard}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.emergencyIcon}>
                <Ionicons name={contact.icon} size={24} color="#e74c3c" />
              </View>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>{contact.title}</Text>
                <Text style={styles.emergencyNumber}>{contact.number}</Text>
                <Text style={styles.emergencyDescription}>{contact.description}</Text>
              </View>
              <Ionicons name="call" size={24} color="#e74c3c" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Вкладки */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              Чат с психологом
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'psychologists' && styles.tabActive]}
            onPress={() => setActiveTab('psychologists')}
          >
            <Text style={[styles.tabText, activeTab === 'psychologists' && styles.tabTextActive]}>
              Специалисты
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'chat' ? (
            <View style={styles.chatSection}>
              <View style={styles.chatPlaceholder}>
                <Ionicons name="chatbubbles-outline" size={64} color="#bdc3c7" />
                <Text style={styles.chatPlaceholderTitle}>Чат с психологом</Text>
                <Text style={styles.chatPlaceholderText}>
                  Задайте вопрос нашему психологу. Мы ответим вам в ближайшее время.
                </Text>
                <TouchableOpacity style={styles.startChatButton}>
                  <Text style={styles.startChatButtonText}>Начать чат</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#3498db" />
                <Text style={styles.infoCardText}>
                  Чат анонимный. Все сообщения защищены и не передаются третьим лицам.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.psychologistsSection}>
              {psychologists.map((psychologist) => (
                <View key={psychologist.id} style={styles.psychologistCard}>
                  <View style={styles.psychologistHeader}>
                    <View style={styles.psychologistAvatar}>
                      <Text style={styles.psychologistAvatarText}>
                        {psychologist.image}
                      </Text>
                    </View>
                    <View style={styles.psychologistInfo}>
                      <Text style={styles.psychologistName}>{psychologist.name}</Text>
                      <Text style={styles.psychologistSpecialty}>
                        {psychologist.specialty}
                      </Text>
                      <View style={styles.psychologistMeta}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color="#f39c12" />
                          <Text style={styles.ratingText}>{psychologist.rating}</Text>
                          <Text style={styles.reviewsText}>({psychologist.reviews})</Text>
                        </View>
                        <View style={styles.experienceContainer}>
                          <Ionicons name="briefcase-outline" size={14} color="#7f8c8d" />
                          <Text style={styles.experienceText}>{psychologist.experience}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      psychologist.available ? styles.statusAvailable : styles.statusUnavailable
                    ]}>
                      <Text style={styles.statusText}>
                        {psychologist.available ? 'Доступен' : 'Занят'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.psychologistEducation}>
                    {psychologist.education}
                  </Text>

                  <View style={styles.psychologistActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.chatButton]}
                      onPress={() => handleChat(psychologist)}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="#3498db" />
                      <Text style={styles.chatButtonText}>Чат</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.bookButton]}
                      onPress={() => handleBookSession(psychologist)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#2ecc71" />
                      <Text style={styles.bookButtonText}>Записаться</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.consultationInfo}>
                <Ionicons name="heart" size={24} color="#e74c3c" />
                <Text style={styles.consultationInfoTitle}>
                  Консультации бесплатны
                </Text>
                <Text style={styles.consultationInfoText}>
                  Все консультации с психологами в нашем приложении проводятся бесплатно.
                  Мы заботимся о вашем психическом здоровье.
                </Text>
              </View>
            </View>
          )}

          {/* Советы по психологической поддержке */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Как справиться со стрессом</Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="leaf" size={20} color="#2ecc71" />
              <Text style={styles.tipText}>Дышите глубоко: 4 секунды вдох, 4 - задержка, 4 - выдох</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="walk" size={20} color="#2ecc71" />
              <Text style={styles.tipText}>Сделайте короткую прогулку на свежем воздухе</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="water" size={20} color="#2ecc71" />
              <Text style={styles.tipText}>Выпейте стакан воды - это поможет успокоиться</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="people" size={20} color="#2ecc71" />
              <Text style={styles.tipText}>Поговорите с близким человеком о своих чувствах</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

