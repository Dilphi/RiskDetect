import React, { useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { useHideNavigationBar } from './HideNavigationBar';

export const ScreenWrapper = ({ children, style }) => {
  const { theme } = useTheme();
  useHideNavigationBar(); // Скрываем навигацию

  useEffect(() => {
    // Настройка статус-бара
    StatusBar.setBarStyle(theme.colors.statusBar);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.background);
      StatusBar.setTranslucent(true);
    }
  }, [theme]);

  return (
    <SafeAreaView 
      style={[
        { 
          flex: 1, 
          backgroundColor: theme.colors.background 
        },
        style
      ]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {children}
      </View>
    </SafeAreaView>
  );
};