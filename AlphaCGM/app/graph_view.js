import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function GraphView() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">You're on the Next Screen!</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
