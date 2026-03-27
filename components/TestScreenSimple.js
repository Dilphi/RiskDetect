import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TestScreenSimple() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔴 ТЕСТОВЫЙ ЭКРАН</Text>
      <Text style={styles.subtitle}>Если вы видите этот текст, значит приложение работает</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => alert('Кнопка нажата!')}
      >
        <Text style={styles.buttonText}>Нажми меня</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});