import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatCard } from './StatCard';
import type { ThemeColors } from './useColors';

export type LearningStatItem = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  accentColor: string;
  progressPercent?: number;
  trendUp?: boolean;
};

type LearningStatsSectionProps = {
  colors: ThemeColors;
  stats: LearningStatItem[];
};

export function LearningStatsSection({ colors, stats }: LearningStatsSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your progress</Text>
      </View>
      <View style={styles.grid}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.gridItem}>
            <StatCard
              colors={colors}
              accentColor={stat.accentColor}
              title={stat.title}
              subtitle={stat.subtitle}
              value={stat.value}
              progressPercent={stat.progressPercent ?? 0}
              trendUp={stat.trendUp ?? true}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48.5%',
    marginBottom: 12,
    minHeight: 108,
  },
});
