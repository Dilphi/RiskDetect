import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ru from '../translation/locales/ru.json';
import kk from '../translation/locales/kk.json';

const TranslationContext = createContext();

const translations = {
  ru: ru,
  kk: kk
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'kk')) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchLanguage = async (lang) => {
    if (lang === language) return;
    if (lang !== 'ru' && lang !== 'kk') return;
    
    setLanguage(lang);
    try {
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation not found for key: ${key} in language: ${language}`);
        return key;
      }
    }
    
    if (typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }
    
    if (Array.isArray(value)) {
      return value;
    }
    
    return value;
  };

  if (isLoading) {
    return null;
  }

  return (
    <TranslationContext.Provider
      value={{
        language,
        switchLanguage,
        t,
        isRTL: language === 'kk'
      }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};