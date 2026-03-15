import {
  DashboardHeader,
  LearningStatsSection,
  PointsCard,
  QuickActionsSection,
} from '@/components/home';
import type { LeaderboardEntry, LearningStatItem, QuickActionItem } from '@/components/home';
import api from '@/lib/axios';
import { getFirstWord } from '@/lib/format';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
const CONTENT_MAX_WIDTH = 600;

const QUICK_ACTIONS: QuickActionItem[] = [
  { label: 'Blog', icon: 'article', href: '/blog' },
  { label: 'Leaderboard', icon: 'leaderboard', href: '/rank' },
];

export default function HomeScreen() {
  const { theme } = themeStore(
    useShallow((state) => ({
      theme: state.theme,
    }))
  );
  const { user } = authStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const { width } = useWindowDimensions();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [totalMarks, setTotalMarks] = useState(0);
  const [top3Leaderboard, setTop3Leaderboard] = useState<LeaderboardEntry[]>([]);
  const [accuracyPercent, setAccuracyPercent] = useState(0);
  const [testsTakenCount, setTestsTakenCount] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setTotalMarks(0);
      setAccuracyPercent(0);
      setTestsTakenCount(0);
      setUserRank(null);
      api
        .get<LeaderboardEntry[]>('/dashbaord/leaderboard')
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [];
          setTop3Leaderboard(list.slice(0, 3));
        })
        .catch(() => setTop3Leaderboard([]))
        .finally(() => setStatsLoading(false));
      return;
    }
    setStatsLoading(true);
    const currentUserId = user?.id;
    Promise.all([
      api.get<{ totalMarks: number; accuracyPercent: number }>('/dashbaord'),
      api.get<{ testId: string; submittedAt: string | null }[]>('/attempts'),
      api.get<LeaderboardEntry[]>('/dashbaord/leaderboard'),
    ])
      .then(([dashboardRes, attemptsRes, leaderboardRes]) => {
        setTotalMarks(dashboardRes.data.totalMarks ?? 0);
        setAccuracyPercent(dashboardRes.data.accuracyPercent ?? 0);
        const submitted = attemptsRes.data.filter((a) => a.submittedAt != null);
        setTestsTakenCount(submitted.length);
        const list = Array.isArray(leaderboardRes.data) ? leaderboardRes.data : [];
        const myEntry = currentUserId ? list.find((e) => e.id === currentUserId) : null;
        setUserRank(myEntry?.rank ?? null);
        setTop3Leaderboard(list.slice(0, 3));
      })
      .catch(() => {
        setTotalMarks(0);
        setAccuracyPercent(0);
        setTestsTakenCount(0);
        setUserRank(null);
        setTop3Leaderboard([]);
      })
      .finally(() => setStatsLoading(false));
  }, [isAuthenticated, user?.id]);

  const learningStats: LearningStatItem[] = useMemo(
    () => [
      {
        id: 'tests',
        title: 'Tests taken',
        subtitle: 'Submitted',
        value: String(statsLoading ? '—' : testsTakenCount),
        accentColor: colors.accent,
        progressPercent: testsTakenCount > 0 ? Math.min(100, testsTakenCount * 10) : 0,
        trendUp: true,
      },
      {
        id: 'progress',
        title: 'Progress',
        subtitle: 'Keep going',
        value: statsLoading ? '—' : `${testsTakenCount} tests`,
        accentColor: colors.primary,
        progressPercent: accuracyPercent,
        trendUp: true,
      },
    ],
    [totalMarks, accuracyPercent, testsTakenCount, statsLoading, colors.primary, colors.success, colors.accent]
  );

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
    HORIZONTAL_PADDING_MAX
  );
  const contentPadding = { paddingHorizontal: horizontalPadding };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <DashboardHeader colors={colors} userName={getFirstWord(user?.name, 'User')} unreadCount={0} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrap, contentPadding]}>
          {statsLoading ? (
            <View style={[styles.skeletonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.skeletonLine, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonAmount, { backgroundColor: colors.border }]} />
              <View style={[styles.skeletonBadge, { backgroundColor: colors.border }]} />
            </View>
          ) : (
            <PointsCard
              colors={colors}
              points={totalMarks}
              accuracyPercent={accuracyPercent}
              userRank={userRank}
              top3={top3Leaderboard}
            />
          )}
          <LearningStatsSection colors={colors} stats={learningStats} />
          <QuickActionsSection colors={colors} items={QUICK_ACTIONS} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 48,
  },
  contentWrap: {
    paddingTop: 20,
    marginTop: -12,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center' as const,
    width: '100%',
  },
  skeletonCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  skeletonLine: {
    width: '40%',
    height: 14,
    borderRadius: 6,
    marginBottom: 12,
    opacity: 0.6,
  },
  skeletonAmount: {
    width: 80,
    height: 36,
    borderRadius: 8,
    marginBottom: 16,
    opacity: 0.5,
  },
  skeletonBadge: {
    width: 120,
    height: 28,
    borderRadius: 8,
    opacity: 0.5,
  },
});
