import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SlipScreen() {
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('хорошо');
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [sleepNotes, setSleepNotes] = useState('');
  const [dreamRecorded, setDreamRecorded] = useState(false);
  const [showStatistics, setShowStatistics] = useState(true);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: '', hours: 7, quality: 'хорошо' });

  // История сна за неделю
  const weeklySleepData = [
    { day: 'Пн', date: '15.01', hours: 7.5, quality: 'хорошо', notes: 'Спал спокойно' },
    { day: 'Вт', date: '16.01', hours: 6.8, quality: 'нормально', notes: 'Проснулся ночью' },
    { day: 'Ср', date: '17.01', hours: 8.2, quality: 'отлично', notes: 'Выспался' },
    { day: 'Чт', date: '18.01', hours: 5.5, quality: 'плохо', notes: 'Бессонница' },
    { day: 'Пт', date: '19.01', hours: 7.0, quality: 'хорошо', notes: '' },
    { day: 'Сб', date: '20.01', hours: 9.0, quality: 'отлично', notes: 'Выходной' },
    { day: 'Вс', date: '21.01', hours: 7.8, quality: 'хорошо', notes: '' }
  ];

  // Качество сна с цветами
  const qualityOptions = [
    { value: 'отлично', label: 'Отлично', color: '#2ecc71', emoji: '😊' },
    { value: 'хорошо', label: 'Хорошо', color: '#27ae60', emoji: '🙂' },
    { value: 'нормально', label: 'Нормально', color: '#f39c12', emoji: '😐' },
    { value: 'плохо', label: 'Плохо', color: '#e74c3c', emoji: '😔' },
    { value: 'очень плохо', label: 'Очень плохо', color: '#c0392b', emoji: '😢' }
  ];

  // Часы сна для выбора
  const hourOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Рекомендации
  const recommendations = [
    'Ложитесь спать в одно и то же время каждый день',
    'Избегайте кофеина за 6 часов до сна',
    'Создайте ритуал перед сном (чтение, медитация)',
    'Поддерживайте в спальне прохладную температуру',
    'Избегайте ярких экранов за 1 час до сна',
    'Регулярно занимайтесь физическими упражнениями',
    'Не употребляйте тяжелую пищу перед сном'
  ];

  const calculateAverageSleep = () => {
    const total = weeklySleepData.reduce((sum, day) => sum + day.hours, 0);
    return (total / weeklySleepData.length).toFixed(1);
  };

  const getSleepQualityStats = () => {
    const stats = {};
    weeklySleepData.forEach(day => {
      stats[day.quality] = (stats[day.quality] || 0) + 1;
    });
    return stats;
  };

  const handleSaveSleep = () => {
    Alert.alert(
      'Данные сохранены',
      `Запись сна добавлена:\nЧасов: ${sleepHours}\nКачество: ${sleepQuality}`,
      [{ text: 'OK' }]
    );
    // Здесь можно добавить логику сохранения в AsyncStorage или бэкенд
  };

  const handleAddRecord = () => {
    setShowAddRecordModal(true);
  };

  const handleSaveNewRecord = () => {
    if (!newRecord.date) {
      Alert.alert('Ошибка', 'Введите дату');
      return;
    }
    Alert.alert('Запись добавлена', `Добавлена запись за ${newRecord.date}`);
    setShowAddRecordModal(false);
    setNewRecord({ date: '', hours: 7, quality: 'хорошо' });
  };

  const getQualityColor = (quality) => {
    const option = qualityOptions.find(q => q.value === quality);
    return option ? option.color : '#95a5a6';
  };

  const handleHourSelect = (hours) => {
    setSleepHours(hours);
  };

  const renderHourSelector = () => (
    <View style={styles.hourSelector}>
      <Text style={styles.hourSelectorLabel}>Выберите часы сна:</Text>
      <View style={styles.hourButtons}>
        {hourOptions.map(hour => (
          <TouchableOpacity
            key={hour}
            style={[
              styles.hourButton,
              sleepHours === hour && styles.hourButtonSelected,
              sleepHours === hour && { backgroundColor: '#2ecc71' }
            ]}
            onPress={() => handleHourSelect(hour)}
          >
            <Text style={[
              styles.hourButtonText,
              sleepHours === hour && styles.hourButtonTextSelected
            ]}>
              {hour} ч
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.customHoursContainer}>
        <Text style={styles.customHoursLabel}>Или введите своё значение:</Text>
        <TextInput
          style={styles.customHoursInput}
          keyboardType="numeric"
          placeholder="7.5"
          value={sleepHours.toString()}
          onChangeText={(text) => {
            const value = parseFloat(text);
            if (!isNaN(value) && value >= 0 && value <= 24) {
              setSleepHours(value);
            }
          }}
        />
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statisticsCard}>
      <View style={styles.statisticsHeader}>
        <Text style={styles.statisticsTitle}>Статистика сна</Text>
        <TouchableOpacity onPress={() => setShowStatistics(!showStatistics)}>
          <Ionicons 
            name={showStatistics ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#7f8c8d" 
          />
        </TouchableOpacity>
      </View>
      
      {showStatistics && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calculateAverageSleep()} ч</Text>
              <Text style={styles.statLabel}>Среднее за неделю</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(...weeklySleepData.map(d => d.hours))} ч
              </Text>
              <Text style={styles.statLabel}>Максимум</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.min(...weeklySleepData.map(d => d.hours))} ч
              </Text>
              <Text style={styles.statLabel}>Минимум</Text>
            </View>
          </View>
          
          <View style={styles.qualityStats}>
            <Text style={styles.qualityStatsTitle}>Качество сна:</Text>
            <View style={styles.qualityBars}>
              {Object.entries(getSleepQualityStats()).map(([quality, count]) => (
                <View key={quality} style={styles.qualityBarContainer}>
                  <View style={styles.qualityBarLabel}>
                    <Text style={[styles.qualityText, { color: getQualityColor(quality) }]}>
                      {quality}
                    </Text>
                    <Text style={styles.qualityCount}>{count} дн.</Text>
                  </View>
                  <View style={styles.qualityBarWrapper}>
                    <View 
                      style={[
                        styles.qualityBar,
                        { 
                          width: `${(count / 7) * 100}%`,
                          backgroundColor: getQualityColor(quality)
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.weeklyCard}>
      <Text style={styles.cardTitle}>Недельная статистика</Text>
      
      <View style={styles.chartContainer}>
        {weeklySleepData.map((day, index) => (
          <View key={index} style={styles.chartColumn}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.sleepBar,
                  { 
                    height: day.hours * 15,
                    backgroundColor: getQualityColor(day.quality)
                  }
                ]}
              />
              <Text style={styles.barLabel}>{day.hours}ч</Text>
            </View>
            <Text style={styles.dayLabel}>{day.day}</Text>
            <Text style={styles.dateLabel}>{day.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recommendationsCard}>
      <Text style={styles.cardTitle}>Рекомендации по сну</Text>
      
      <ScrollView style={styles.recommendationsList} showsVerticalScrollIndicator={false}>
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderAddRecordModal = () => (
    <Modal
      visible={showAddRecordModal}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Добавить запись сна</Text>
            <TouchableOpacity onPress={() => setShowAddRecordModal(false)}>
              <Ionicons name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalForm}>
            <Text style={styles.modalLabel}>Дата (ДД.ММ)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="21.01"
              value={newRecord.date}
              onChangeText={(text) => setNewRecord({...newRecord, date: text})}
            />
            
            <Text style={styles.modalLabel}>Часы сна</Text>
            <View style={styles.modalHourButtons}>
              {[4, 5, 6, 7, 8, 9, 10].map(hour => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.modalHourButton,
                    newRecord.hours === hour && styles.modalHourButtonSelected
                  ]}
                  onPress={() => setNewRecord({...newRecord, hours: hour})}
                >
                  <Text style={[
                    styles.modalHourButtonText,
                    newRecord.hours === hour && styles.modalHourButtonTextSelected
                  ]}>
                    {hour} ч
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.modalLabel}>Качество сна</Text>
            <View style={styles.qualityButtons}>
              {qualityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.qualityButton,
                    newRecord.quality === option.value && styles.qualityButtonSelected,
                    { borderColor: option.color }
                  ]}
                  onPress={() => setNewRecord({...newRecord, quality: option.value})}
                >
                  <Text style={styles.qualityButtonEmoji}>{option.emoji}</Text>
                  <Text style={styles.qualityButtonLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowAddRecordModal(false)}
            >
              <Text style={styles.modalButtonCancelText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleSaveNewRecord}
            >
              <Text style={styles.modalButtonSaveText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Мониторинг сна</Text>
          <Text style={styles.subtitle}>Отслеживайте качество и продолжительность сна</Text>
        </View>

        {/* Быстрая запись сегодняшнего сна */}
        <View style={styles.quickRecordCard}>
          <Text style={styles.cardTitle}>Сегодняшний сон</Text>
          
          <View style={styles.quickRecordRow}>
            {renderHourSelector()}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Качество сна:</Text>
              <View style={styles.qualityButtonsHorizontal}>
                {qualityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityButtonSmall,
                      sleepQuality === option.value && styles.qualityButtonSmallSelected,
                      { backgroundColor: sleepQuality === option.value ? option.color : '#f5f5f5' }
                    ]}
                    onPress={() => setSleepQuality(option.value)}
                  >
                    <Text style={styles.qualityButtonSmallEmoji}>{option.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.timeInputRow}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>Лёг спать</Text>
                <TextInput
                  style={styles.timeInput}
                  value={bedTime}
                  onChangeText={setBedTime}
                  placeholder="23:00"
                />
              </View>
              
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>Проснулся</Text>
                <TextInput
                  style={styles.timeInput}
                  value={wakeUpTime}
                  onChangeText={setWakeUpTime}
                  placeholder="07:00"
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSleep}>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Статистика */}
        {renderStatistics()}

        {/* Недельная диаграмма */}
        {renderWeeklyChart()}

        {/* Рекомендации */}
        {renderRecommendations()}

        {/* Кнопка добавления записи */}
        <TouchableOpacity style={styles.addRecordButton} onPress={handleAddRecord}>
          <Ionicons name="add-circle" size={24} color="#2ecc71" />
          <Text style={styles.addRecordButtonText}>Добавить прошлую запись</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Модальное окно добавления записи */}
      {renderAddRecordModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  quickRecordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  quickRecordRow: {
    gap: 16,
  },
  hourSelector: {
    marginBottom: 16,
  },
  hourSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 12,
  },
  hourButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hourButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 60,
    alignItems: 'center',
  },
  hourButtonSelected: {
    backgroundColor: '#2ecc71',
  },
  hourButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  hourButtonTextSelected: {
    color: 'white',
  },
  customHoursContainer: {
    marginTop: 8,
  },
  customHoursLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  customHoursInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  qualityButtonsHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  qualityButtonSmall: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  qualityButtonSmallSelected: {
    borderWidth: 2,
    borderColor: 'white',
  },
  qualityButtonSmallEmoji: {
    fontSize: 20,
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statisticsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  qualityStats: {
    marginTop: 16,
  },
  qualityStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  qualityBars: {
    gap: 12,
  },
  qualityBarContainer: {
    gap: 4,
  },
  qualityBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  qualityCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  qualityBarWrapper: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  qualityBar: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 220,
    alignItems: 'flex-end',
  },
  chartColumn: {
    alignItems: 'center',
    width: '14%',
  },
  barContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepBar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dayLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  recommendationsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    maxHeight: 300,
  },
  recommendationsList: {
    maxHeight: 200,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fff9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#2ecc71',
    borderStyle: 'dashed',
    gap: 8,
  },
  addRecordButtonText: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalForm: {
    gap: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  modalHourButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalHourButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: 50,
    alignItems: 'center',
  },
  modalHourButtonSelected: {
    backgroundColor: '#2ecc71',
  },
  modalHourButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  modalHourButtonTextSelected: {
    color: 'white',
  },
  qualityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  qualityButtonSelected: {
    backgroundColor: '#f9fff9',
  },
  qualityButtonEmoji: {
    fontSize: 16,
  },
  qualityButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  modalButtonCancelText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonSave: {
    backgroundColor: '#2ecc71',
  },
  modalButtonSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});