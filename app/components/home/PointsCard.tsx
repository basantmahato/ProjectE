import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getFirstWord } from '@/lib/format';
import type { ThemeColors } from './useColors';

export type LeaderboardEntry = { id: string; rank: number; name: string | null; totalMarks: number };

type PointsCardProps = {
  colors: ThemeColors;
  points?: number;
  accuracyPercent?: number;
  userRank?: number | null;
  top3?: LeaderboardEntry[];
};

const RANK_COLORS = ['#fbbf24', '#9ca3af', '#d97706'] as const; // gold, silver, bronze

export function PointsCard({
  colors,
  points = 0,
  accuracyPercent = 0,
  userRank = null,
  top3 = [],
}: PointsCardProps) {
  const router = useRouter();
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
      {top3.length > 0 && (
        <View style={[styles.top3Wrap, { borderTopColor: colors.border }]}>
          <Text style={[styles.top3Title, { color: colors.subText }]}>Top 3</Text>
          <View style={styles.top3Row}>
            {top3.map((entry, index) => (
              <View key={entry.id} style={styles.top3Item}>
                <View style={[styles.top3RankBadge, { backgroundColor: RANK_COLORS[index] + '30' }]}>
                  <Text style={[styles.top3RankText, { color: RANK_COLORS[index] }]}>{entry.rank}</Text>
                </View>
                <Text style={[styles.top3Name, { color: colors.text }]} numberOfLines={1}>
                  {getFirstWord(entry.name, 'Anonymous')}
                </Text>
                <Text style={[styles.top3Pts, { color: colors.subText }]}>{entry.totalMarks} pts</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.viewLeaderboardBtn,
              { backgroundColor: colors.primary + (pressed ? '35' : '22') },
            ]}
            onPress={() => router.push('/rank')}
          >
            <Text style={[styles.viewLeaderboardBtnText, { color: colors.primary }]}>
              View leaderboard
            </Text>
          </Pressable>
        </View>
      )}
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
  top3Wrap: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  top3Title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  top3Row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  top3Item: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  top3RankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  top3RankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  top3Name: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  top3Pts: {
    fontSize: 11,
    fontWeight: '500',
  },
  viewLeaderboardBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewLeaderboardBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
