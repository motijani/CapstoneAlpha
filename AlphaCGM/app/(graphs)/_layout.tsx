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
          tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" color={color} size={size} />,
        }}
      />
       <Tabs.Screen 
        name="meal-plans"
        options={{
          title: 'Meal Plans',
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" color={color} size={size} />,
        }}
      />
       <Tabs.Screen 
        name="log-entries"
        options={{
          title: 'Log Entries',
          tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
