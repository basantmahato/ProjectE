import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ThemeColors } from './types';

const CARD_PADDING_H_MIN = 16;
const CARD_PADDING_H_MAX = 24;
const CARD_PADDING_V = 20;

type ProgressOverviewCardProps = {
  colors: ThemeColors;
  attendancePercent?: number;
  points?: number;
};

export function ProgressOverviewCard({
  colors,
  attendancePercent = 85,
  points = 750,
}: ProgressOverviewCardProps) {
  const { width } = useWindowDimensions();
  const paddingH = Math.min(
    Math.max(width * 0.05, CARD_PADDING_H_MIN),
    CARD_PADDING_H_MAX
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          paddingHorizontal: paddingH,
          paddingVertical: CARD_PADDING_V,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Progress Overview
      </Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={[styles.value, { color: colors.text }]}>
            {attendancePercent}%
          </Text>
          <Text style={[styles.label, { color: colors.subText }]}>
            Attendance
          </Text>
        </View>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <View style={styles.metricBlock}>
          <Text style={[styles.value, { color: colors.text }]}>{points}</Text>
          <Text style={[styles.label, { color: colors.subText }]}>Points</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
  },
  separator: {
    width: 1,
    height: 40,
    borderRadius: 1,
  },
});
