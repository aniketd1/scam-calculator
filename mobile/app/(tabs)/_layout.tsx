import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fbf7f0',
          borderTopColor: '#e6e9ef',
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter_500Medium',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />

      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: () => <TabIcon emoji="⚡" />,
        }}
      />

      <Tabs.Screen
        name="awareness"
        options={{
          title: 'Awareness',
          tabBarIcon: () => <TabIcon emoji="📚" />,
        }}
      />

      <Tabs.Screen
        name="verification"
        options={{
          title: 'Verify',
          tabBarIcon: () => <TabIcon emoji="✅" />,
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: () => <TabIcon emoji="🚨" />,
        }}
      />
    </Tabs>
  );
}