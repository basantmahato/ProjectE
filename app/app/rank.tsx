import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import api from '@/lib/axios';
import { getFirstWord } from '@/lib/format';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

const CONTENT_MAX_WIDTH = 500;

type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string | null;
  totalMarks: number;
};

export default function Rank() {
  const router = useRouter();
  const currentUserId = authStore((state) => state.user?.id);
  const theme = themeStore((state) => state.theme);
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const myEntry = list.find((e) => e.id === currentUserId);

  const { width } = Dimensions.get('window');
  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 24);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const { data } = await api.get<LeaderboardEntry[]>('/dashbaord/leaderboard');
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError('Failed to load leaderboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { backgroundColor: '#fbbf24' }; // gold
    if (rank === 2) return { backgroundColor: '#9ca3af' };  // silver
    if (rank === 3) return { backgroundColor: '#d97706' };  // bronze
    return { backgroundColor: colors.border };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboard</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Top users by total score
        </Text>

        {!loading && !error && list.length > 0 && myEntry && (
          <View style={[styles.myRankCard, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="emoji-events" size={24} color="#fff" />
            <Text style={styles.myRankLabel}>Your rank</Text>
            <Text style={styles.myRankValue}>#{myEntry.rank}</Text>
            <Text style={styles.myRankScore}>{myEntry.totalMarks} pts</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorWrap}>
            <MaterialIcons name="error-outline" size={48} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialIcons name="leaderboard" size={40} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>No entries yet</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {list.map((entry) => {
              const isCurrentUser = entry.id === currentUserId;
              return (
              <View
                key={entry.id}
                style={[
                  styles.row,
                  {
                    backgroundColor: isCurrentUser ? colors.primary + '22' : colors.card,
                    borderColor: isCurrentUser ? colors.primary : colors.border,
                    borderWidth: isCurrentUser ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.rankBadge, getRankStyle(entry.rank)]}>
                  <Text style={styles.rankText}>{entry.rank}</Text>
                </View>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {getFirstWord(entry.name, 'Anonymous')}
                </Text>
                <Text style={[styles.score, { color: colors.primary }]}>{entry.totalMarks}</Text>
                {isCurrentUser && (
                  <Text style={[styles.youBadge, { color: colors.primary }]}>You</Text>
                )}
              </View>
            );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    gap: 10,
  },
  myRankLabel: { fontSize: 14, color: '#fff', fontWeight: '500' },
  myRankValue: { fontSize: 20, color: '#fff', fontWeight: '700' },
  myRankScore: { fontSize: 14, color: '#fff', marginLeft: 'auto', fontWeight: '600' },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: { fontSize: 15 },
  errorWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  errorText: { fontSize: 15 },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { fontSize: 15 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  score: {
    fontSize: 16,
    fontWeight: '700',
  },
  youBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
});
