import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from './types';

type AvatarProps = {
  initial: string;
  name: string;
  colors: ThemeColors;
};

export function Avatar({ initial, name, colors }: AvatarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: colors.card }]}>
        <Text style={[styles.initial, { color: colors.text }]}>
          {initial.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initial: {
    fontSize: 26,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
});
