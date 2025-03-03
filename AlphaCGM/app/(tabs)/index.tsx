import { Image, StyleSheet, Platform } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {

  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">New Pages</ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/signin')}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Sign In</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={() => router.push('/glucose')}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Graph View</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, {marginTop: 10}]}
          onPress={() => router.push('/secondview')}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>Second View</ThemedText>
        </TouchableOpacity>






      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
});
