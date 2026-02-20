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
          await NavigationBar.setButtonStyleAsync(
            theme.dark ? 'light' : 'dark'
          );
          
       
          
        } catch (error) {
          console.error('Error configuring navigation bar:', error);
        }
      };

      configureNavigationBar();

      return () => {
        // Возвращаем настройки по умолчанию при выходе
        NavigationBar.setButtonStyleAsync('dark');
      };
    }
  }, [theme]);
};