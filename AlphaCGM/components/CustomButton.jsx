import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.button, isLoading && styles.disabledButton, containerStyles]}
      disabled={isLoading}
    >
      <Text style={[styles.buttonText, textStyles]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#38BDF8', // Secondary-200 color
    borderRadius: 12,
    minHeight: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#1E293B', // Primary color
    fontWeight: '600',
    fontSize: 18,
  },
});

export default CustomButton;