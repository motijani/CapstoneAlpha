import { View, Text, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import FormField from '../components/FormField';
import CustomButton from '../components/CustomButton';

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [isSubmitting, setisSubmitting] = useState(false);

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the fields');
    }
    setisSubmitting(true);
    // Backend integration logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.innerContainer}>
          {/* Logo Image Here */}
          <Text style={styles.title}>
            Sign up to <Text style={styles.highlight}>Capstone Alpha</Text>
          </Text>

          <View style={styles.fieldContainer}>
            <FormField
              title="Username"
              value={form.username}
              handleChangeText={(e) => setForm({ ...form, username: e })}
            />
          </View>
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
              title="Sign Up"
              handlePress={submit}
              isLoading={isSubmitting}
            />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Have an account already?</Text>
            <TouchableOpacity
                     style={styles.button}
                     onPress={() => router.push('/signin')}>
                     <ThemedText type="defaultSemiBold" style={styles.highlight}>Sign in</ThemedText>
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
    backgroundColor: '#1E293B', // Primary color
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
    color: '#38BDF8', // Secondary color
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

export default SignUp;
