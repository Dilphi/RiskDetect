import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from './Translation';
import { useTheme } from './ThemeContext';

const LanguageSwitcher = ({ style }) => {
  const { language, switchLanguage } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          language === 'ru' && [styles.activeButton, { backgroundColor: theme.colors.primary }]
        ]}
        onPress={() => switchLanguage('ru')}
      >
        <Text style={[
          styles.text,
          { color: language === 'ru' ? theme.colors.white : theme.colors.textSecondary }
        ]}>
          Рус
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.button,
          language === 'kk' && [styles.activeButton, { backgroundColor: theme.colors.primary }]
        ]}
        onPress={() => switchLanguage('kk')}
      >
        <Text style={[
          styles.text,
          { color: language === 'kk' ? theme.colors.white : theme.colors.textSecondary }
        ]}>
          Қаз
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5', // Добавим фон для видимости
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeButton: {},
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LanguageSwitcher;