import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from './useColors';

type StatCardProps = {
  colors: ThemeColors;
  accentColor: string;
  title: string;
  subtitle: string;
  value: string;
  progressPercent?: number;
  trendUp?: boolean;
};

export function StatCard({
  colors,
  accentColor,
  title,
  subtitle,
  value,
  progressPercent = 60,
  trendUp = true,
}: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: accentColor + '15' }]}>
      <View style={styles.topRow}>
        <View style={[styles.progressCircle, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.progressText, { color: accentColor }]}>{progressPercent}%</Text>
        </View>
        <MaterialIcons
          name={trendUp ? 'trending-up' : 'trending-down'}
          size={18}
          color={accentColor}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.subText }]} numberOfLines={1}>
        {subtitle}
      </Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12, // Reduced internal padding
    borderWidth: 0, // Explicitly no border
    // Shadows/Elevation removed to eliminate the double-border effect
    elevation: 0,
    shadowOpacity: 0, 
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 6,
    opacity: 0.6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
});