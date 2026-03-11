import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from './useColors';

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type WelcomeGreetingProps = {
  colors: ThemeColors;
  userName?: string;
};

export function WelcomeGreeting({ colors, userName = 'there' }: WelcomeGreetingProps) {
  const greeting = getTimeBasedGreeting();

  return (
    <View style={styles.container}>
      <Text style={[styles.welcome, { color: colors.text }]}>
        Welcome back, {userName}.
      </Text>
      <Text style={[styles.greeting, { color: colors.subText }]}>
        {greeting}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
});
