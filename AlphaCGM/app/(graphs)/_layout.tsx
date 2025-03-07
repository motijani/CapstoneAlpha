import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
       <Tabs.Screen 
        name="glucose"
        options={{
          title: 'Glucose',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={color} size={size} />,
        }}
      />
       <Tabs.Screen 
        name="calories"
        options={{
          title: 'Calories',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
       <Tabs.Screen 
        name="exercise"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}