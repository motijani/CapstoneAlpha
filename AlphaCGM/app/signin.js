import { View, Text, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';

import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';

const SignIn = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }
    router.push('../graph_view')
    setSubmitting(true);
    // Authentication logic here
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.innerContainer}>
          {/* Logo Image Here */}
          <Text style={styles.title}>
            Log in to <Text style={styles.highlight}>Capstone Alpha</Text>
          </Text>

          <View style={styles.fieldContainer}>
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.fieldContainer}>
            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Sign In"
              handlePress={submit}
              isLoading={isSubmitting}
            />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('../signup')}>
          <ThemedText type="defaultSemiBold" style={styles.highlight}>Sign Up</ThemedText>
        </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B', // Adjust primary color
  },
  innerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
    marginTop: 10,
  },
  highlight: {
    color: '#38BDF8', // Adjust secondary color
  },
  fieldContainer: {
    marginTop: 16,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 48,
    width: '100%',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    gap: 8,
  },
  signupText: {
    fontSize: 16,
    color: '#D1D5DB', // Gray-100
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38BDF8',
  },
});

export default SignIn;
