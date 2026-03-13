import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ThemeColors } from './useColors';

type PointsCardProps = {
  colors: ThemeColors;
  points?: number;
  accuracyPercent?: number;
  userRank?: number | null;
};

export function PointsCard({
  colors,
  points = 0,
  accuracyPercent = 0,
  userRank = null,
}: PointsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.mainRow}>
        <View style={styles.leftCol}>
          <Text style={[styles.label, { color: colors.subText }]}>Total Points</Text>
          <Text style={[styles.amount, { color: colors.text }]}>{points}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '25' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {accuracyPercent}% Accuracy
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.rankCol, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '35' }]}>
          <Text style={[styles.rankLabel, { color: colors.subText }]}>Your rank</Text>
          <Text style={[styles.rankValue, { color: colors.primary }]}>
            {userRank != null ? `#${userRank}` : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 16,
  },
  leftCol: {
    flex: 1,
  },
  rankCol: {
    minWidth: 76,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rankLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  rankValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
