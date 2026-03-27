    import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TestTranslation({ onPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onPress('ru')}>
        <Text style={styles.text}>Рус</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onPress('kk')}>
        <Text style={styles.text}>Қаз</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});