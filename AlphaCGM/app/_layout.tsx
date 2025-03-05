import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* 
        This tells Expo Router:
        - If the user visits a route starting with "(tabs)/",
          use the Tab Layout from app/(tabs)/_layout.tsx.
        - You can also register other screens here, e.g. "signin".
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(graphs)" options={{ headerShown: false }} />
      <Stack.Screen name="signin" />
    </Stack>
  );
}