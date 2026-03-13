import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';

export default function TabLayout() {
  const { theme } = themeStore(
    useShallow((state) => ({
      theme: state.theme,
    }))
  );

  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="safari" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tests"
        options={{
          headerShown: false,
          title: 'Tests',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="book.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}