// components/HideNavigationBar.js
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from './ThemeContext';

export const useHideNavigationBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      const configureNavigationBar = async () => {
        try {
          // ✅ Эти методы работают с edge-to-edge
          await NavigationBar.setButtonStyleAsync(
            theme.dark ? 'light' : 'dark'
          );
          await NavigationBar.setBackgroundColorAsync(theme.colors.background);
          
          // ❌ setVisibilityAsync и setBehaviorAsync удалены
          // ❌ setVisibilityAsync и setBehaviorAsync удалены
        } catch (error) {
          console.error('Error configuring navigation bar:', error);
        }
      };

      configureNavigationBar();

      return () => {
        // Возвращаем настройки по умолчанию при выходе
        NavigationBar.setButtonStyleAsync('dark');
        NavigationBar.setBackgroundColorAsync('#ffffff');
      };
    }
  }, [theme]);
};