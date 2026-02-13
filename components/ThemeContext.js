import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Цветовые схемы
export const lightTheme = {
  dark: false,
  colors: {
    primary: '#2ecc71',
    primaryLight: '#f9fff9',
    secondary: '#3498db',
    warning: '#f39c12',
    danger: '#e74c3c',
    purple: '#9b59b6',
    orange: '#e67e22',
    dark: '#2c3e50',
    gray: '#7f8c8d',
    lightGray: '#95a5a6',
    border: '#dfe6e9',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0,0,0,0.5)',
    success: '#2ecc71',
    error: '#e74c3c',
    info: '#3498db',
    header: '#2ecc71',
    tabBar: '#ffffff',
    statusBar: 'dark-content',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#2ecc71',
    primaryLight: '#1a3a2a',
    secondary: '#2980b9',
    warning: '#f39c12',
    danger: '#c0392b',
    purple: '#8e44ad',
    orange: '#d35400',
    dark: '#ecf0f1',
    gray: '#bdc3c7',
    lightGray: '#7f8c8d',
    border: '#34495e',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#ecf0f1',
    textSecondary: '#bdc3c7',
    white: '#ecf0f1',
    black: '#1a1a2e',
    overlay: 'rgba(0,0,0,0.8)',
    success: '#2ecc71',
    error: '#e74c3c',
    info: '#3498db',
    header: '#16213e',
    tabBar: '#16213e',
    statusBar: 'light-content',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'true');
      } else {
        // Если нет сохраненной темы, используем системную
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    try {
      await AsyncStorage.setItem('darkMode', String(newValue));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);