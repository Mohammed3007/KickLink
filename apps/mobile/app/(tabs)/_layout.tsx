import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: '#9A98A4',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={23} /> }}
      />
      <Tabs.Screen
        name="games"
        options={{ title: 'Games', tabBarIcon: ({ color }) => <Ionicons name="football" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="orgs"
        options={{ title: 'Organizations', tabBarIcon: ({ color }) => <Ionicons name="people" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Notifications', tabBarIcon: ({ color }) => <Ionicons name="notifications" color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person-circle" color={color} size={24} /> }}
      />
    </Tabs>
  );
}
