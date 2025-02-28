import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';


import icons from '../constants/icons'


const FormField = ({ title, value, placeholder, handleChangeText, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#D1D5DB" // Gray-100
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
          {...props}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image 
              source={!showPassword ? icons.eyeHide : icons.eye}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#D1D5DB', // Gray-100
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: '#38BDF8', // Secondary color
    width: '100%',
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E', // Black-100
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    width: 32,
    height: 32,
    marginTop: 4,
  },
});

export default FormField;
