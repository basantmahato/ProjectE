import {
  AchievementsCard,
  ProgressOverviewCard,
  RecentActivitiesCard,
} from '@/components/explore';
import type { AchievementItem, ActivityItem } from '@/components/explore';
import { DashboardHeader } from '@/components/home';
import api from '@/lib/axios';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
const CONTENT_MAX_WIDTH = 600;
const RECENT_ACTIVITIES_LIMIT = 10;

// Purple for Team Player - theme-friendly accent (not in base palette)
const ACHIEVEMENT_PURPLE_LIGHT = '#8b5cf6';
const ACHIEVEMENT_PURPLE_DARK = '#a78bfa';

interface PublishedTest {
  id: string;
  title: string;
}

interface TestAttempt {
  id: string;
  testId: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
}

function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function ExploreScreen() {
  const { theme } = themeStore(
    useShallow((state) => ({ theme: state.theme }))
  );
  const { width } = useWindowDimensions();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
    HORIZONTAL_PADDING_MAX
  );
  const contentPadding = { paddingHorizontal: horizontalPadding };

  const achievementDefinitions = useMemo(
    () => [
      { id: 'beginner', label: 'Beginner', icon: 'star' as const, requiredPoints: 100, accentColor: colors.accent },
      { id: 'code-master', label: 'Code Master', icon: 'code' as const, requiredPoints: 250, accentColor: colors.primary },
      { id: 'top-student', label: 'Top Student', icon: 'emoji-events' as const, requiredPoints: 500, accentColor: colors.success },
      { id: 'team-player', label: 'Team Player', icon: 'workspace-premium' as const, requiredPoints: 1000, accentColor: dark ? ACHIEVEMENT_PURPLE_DARK : ACHIEVEMENT_PURPLE_LIGHT },
    ],
    [colors.accent, colors.primary, colors.success, dark]
  );

  const fallbackActivities: ActivityItem[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Completed JavaScript Quiz',
        timeAgo: '2 hours ago',
        dotColor: colors.success,
      },
      {
        id: '2',
        title: 'Submitted CSS Project',
        timeAgo: 'Yesterday',
        dotColor: colors.primary,
      },
      {
        id: '3',
        title: 'Attended HTML Workshop',
        timeAgo: '2 days ago',
        dotColor: dark ? ACHIEVEMENT_PURPLE_DARK : ACHIEVEMENT_PURPLE_LIGHT,
      },
    ],
    [colors.success, colors.primary, dark]
  );

  type FetchedActivity = { id: string; title: string; timeAgo: string; submitted: boolean };
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [totalMarks, setTotalMarks] = useState<number>(0);
  const [accuracyPercent, setAccuracyPercent] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const isAuthenticated = authStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setActivities([]);
      setActivitiesLoading(false);
      setActivitiesError(null);
      return;
    }
    setActivitiesLoading(true);
    setActivitiesError(null);
    Promise.all([
      api.get<PublishedTest[]>('/tests/published'),
      api.get<TestAttempt[]>('/attempts'),
    ])
      .then(([testsRes, attemptsRes]) => {
        const tests = testsRes.data;
        const attempts = attemptsRes.data;
        const testMap = new Map(tests.map((t) => [t.id, t]));
        const withTest = attempts
          .map((attempt) => ({
            attempt,
            test: testMap.get(attempt.testId),
          }))
          .filter((x): x is { attempt: TestAttempt; test: PublishedTest } => x.test != null);
        const sorted = withTest.sort(
          (a, b) =>
            new Date(b.attempt.submittedAt ?? b.attempt.startedAt).getTime() -
            new Date(a.attempt.submittedAt ?? a.attempt.startedAt).getTime()
        );
        const recent = sorted.slice(0, RECENT_ACTIVITIES_LIMIT);
        const mapped: FetchedActivity[] = recent.map(({ attempt, test }) => ({
          id: attempt.id,
          title: attempt.submittedAt ? `Completed ${test.title}` : `Started ${test.title}`,
          timeAgo: formatTimeAgo(attempt.submittedAt ?? attempt.startedAt),
          submitted: !!attempt.submittedAt,
        }));
        setActivities(mapped);
      })
      .catch(() => {
        setActivitiesError('Could not load recent activities.');
        setActivities([]);
      })
      .finally(() => setActivitiesLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTotalMarks(0);
      setAccuracyPercent(0);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    api
      .get<{ totalMarks: number; accuracyPercent: number }>('/dashbaord')
      .then((res) => {
        setTotalMarks(res.data.totalMarks ?? 0);
        setAccuracyPercent(res.data.accuracyPercent ?? 0);
      })
      .catch(() => {
        setTotalMarks(0);
        setAccuracyPercent(0);
      })
      .finally(() => setStatsLoading(false));
  }, [isAuthenticated]);

  const achievements: AchievementItem[] = useMemo(
    () =>
      achievementDefinitions.map((def) => ({
        id: def.id,
        label: def.label,
        icon: def.icon,
        accentColor: def.accentColor,
        unlocked: !statsLoading && totalMarks >= def.requiredPoints,
      })),
    [achievementDefinitions, totalMarks, statsLoading]
  );

  const activitiesToShow: ActivityItem[] = useMemo(() => {
    if (!isAuthenticated) {
      return []; // When not logged in, show only real (empty) activity — no dummy data
    }
    if (activities.length > 0) {
      return activities.map((a) => ({
        id: a.id,
        title: a.title,
        timeAgo: a.timeAgo,
        dotColor: a.submitted ? colors.success : colors.primary,
      }));
    }
    return fallbackActivities;
  }, [isAuthenticated, activities, fallbackActivities, colors.success, colors.primary]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <DashboardHeader
        colors={colors}
        unreadCount={0}
        title="Explore"
        subtitle="Your progress, achievements & recent activity"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrap, contentPadding]}>
          <ProgressOverviewCard
            colors={colors}
            accuracyPercent={statsLoading ? 0 : accuracyPercent}
            points={statsLoading ? 0 : totalMarks}
          />
          <AchievementsCard colors={colors} achievements={achievements} />
          {activitiesLoading ? (
            <View style={[styles.activityLoader, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.activityLoaderText, { color: colors.subText }]}>
                Loading recent activities…
              </Text>
            </View>
          ) : null}
          {!activitiesLoading && (
            <>
              {activitiesError ? (
                <Text style={[styles.activityError, { color: colors.danger }]}>
                  {activitiesError}
                </Text>
              ) : null}
              <RecentActivitiesCard colors={colors} activities={activitiesToShow} />
            </>
          )}
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
    paddingBottom: 32,
  },
  contentWrap: {
    paddingTop: 20,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  activityLoader: {
    borderRadius: 16,
    marginBottom: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  activityLoaderText: {
    fontSize: 14,
  },
  activityError: {
    fontSize: 14,
    marginBottom: 8,
  },
});
