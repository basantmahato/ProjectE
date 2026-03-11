import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatCard } from './StatCard';
import type { ThemeColors } from './useColors';

type TodayStatsSectionProps = {
  colors: ThemeColors;
};

function getStats(colors: ThemeColors) {
  return [
    {
      id: 'sales',
      title: 'Sales',
      subtitle: 'Total sales today',
      value: '$200,000',
      accentColor: colors.success,
      progressPercent: 60,
      trendUp: true,
    },
    {
      id: 'profit',
      title: 'Profit',
      subtitle: 'Total profit today',
      value: '$128,000',
      accentColor: colors.accent,
      progressPercent: 60,
      trendUp: true,
    },
    {
      id: 'orders',
      title: 'Orders',
      subtitle: 'Total orders today',
      value: '07',
      accentColor: colors.primary,
      progressPercent: 60,
      trendUp: true,
    },
    {
      id: 'loss',
      title: 'Loss',
      subtitle: 'Total loss today',
      value: '$2,800',
      accentColor: colors.danger,
      progressPercent: 60,
      trendUp: false,
    },
  ];
}

export function TodayStatsSection({ colors }: TodayStatsSectionProps) {
  const stats = getStats(colors);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Stats</Text>
        <TouchableOpacity
          style={[styles.analyzeBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.analyzeText}>Analyze</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>AI</Text>
          </View>
        </TouchableOpacity>
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
              progressPercent={stat.progressPercent}
              trendUp={stat.trendUp}
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
    paddingHorizontal: 16, // Optional: padding for the whole section
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
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 10,
    gap: 4,
  },
  analyzeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aiText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48.5%', // Calculated to fit 2 items with a small gap
    marginBottom: 12,
  },
});