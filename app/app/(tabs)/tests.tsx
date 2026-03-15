import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';

import { DashboardHeader } from '@/components/home';
import api from '@/lib/axios';
import { canAccessFeature } from '@/lib/plans';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
const CONTENT_MAX_WIDTH = 600;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

interface PublishedTest {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  scheduledAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface TestAttempt {
  id: string;
  testId: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
}

const TEST_CATEGORIES: Array<{
  id: string;
  title: string;
  icon: string;
  count: string;
  color: string;
  route?: string;
}> = [
  { id: '1', title: 'Upcoming', icon: '📅', count: 'Scheduled', color: '#10b981', route: '/upcoming-tests' },
  { id: '2', title: 'Recent Tests', icon: '🕐', count: 'Attempted', color: '#6366f1', route: '/recent-tests' },
  { id: '3', title: 'Mock Tests', icon: '📝', count: 'Practice', color: '#f59e0b', route: '/mock-tests' },
  { id: '4', title: 'Sample Papers', icon: '📄', count: 'Read', color: '#3b82f6', route: '/sample-papers' },
  { id: '5', title: 'Interview Prep', icon: '💼', count: 'Topic wise', color: '#8b5cf6', route: '/interview-prep' },
  { id: '6', title: 'Performance', icon: '📊', count: 'View Stats', color: '#ec4899', route: '/performance' },
];

const CATEGORY_ROWS = chunk(TEST_CATEGORIES, 2);

const ACCENT_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

const TestScreen = () => {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const user = authStore((state) => state.user);
  const { width } = useWindowDimensions();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;
  const canAccessInterviewPrep = canAccessFeature(user?.plan, 'interviewPrep');

  const horizontalPadding = useMemo(
    () => Math.min(Math.max(width * 0.05, HORIZONTAL_PADDING_MIN), HORIZONTAL_PADDING_MAX),
    [width]
  );
  const contentPadding = useMemo(() => ({ paddingHorizontal: horizontalPadding }), [horizontalPadding]);

  const [activeTests, setActiveTests] = useState<PublishedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [testsError, setTestsError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<PublishedTest[]>('/tests/published'),
      api.get<TestAttempt[]>('/attempts'),
    ])
      .then(([testsRes, attemptsRes]) => {
        const allTests = testsRes.data;
        const attempts = attemptsRes.data;

        const attemptByTestId = new Map<string, TestAttempt>();
        for (const attempt of attempts) {
          const existing = attemptByTestId.get(attempt.testId);
          if (!existing || new Date(attempt.startedAt) > new Date(existing.startedAt)) {
            attemptByTestId.set(attempt.testId, attempt);
          }
        }

        const notAttempted = allTests.filter((test) => !attemptByTestId.has(test.id));
        setActiveTests(notAttempted);
        setTestsError(null);
      })
      .catch(() => {
        setActiveTests([]);
        setTestsError('Could not load tests. Check your connection.');
      })
      .finally(() => setLoading(false));
  }, []);

  const renderActiveTestsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Tests</Text>
        {!loading && !testsError && (
          <View style={[styles.sectionBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.sectionBadgeText, { color: colors.primary }]}>
              {activeTests.length} available
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : testsError ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={[styles.emptyText, { color: colors.subText }]}>{testsError}</Text>
        </View>
      ) : activeTests.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyText, { color: colors.subText }]}>No active tests right now</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {activeTests.map((test, index) => {
            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
            return (
              <TouchableOpacity
                key={test.id}
                style={[styles.activeTestCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/test/${test.id}`)}
                activeOpacity={0.75}
              >
                <View style={[styles.activeTestAccent, { backgroundColor: accent }]} />
                <View style={styles.activeTestContent}>
                  <Text style={[styles.activeTestTitle, { color: colors.text }]} numberOfLines={2}>
                    {test.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.metaPill, { backgroundColor: accent + '18' }]}>
                      <Text style={[styles.metaPillText, { color: accent }]}>
                        {test.durationMinutes} min
                      </Text>
                    </View>
                    <View style={[styles.metaPill, { backgroundColor: accent + '18' }]}>
                      <Text style={[styles.metaPillText, { color: accent }]}>
                        {test.totalMarks} marks
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ctaText, { color: accent }]}>Attempt now →</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <DashboardHeader
        colors={colors}
        unreadCount={0}
        title="Practice Arena"
        subtitle="Select a category to begin your prep"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrap, contentPadding]}>
          {renderActiveTestsSection()}
          <Text style={[styles.categoriesLabel, { color: colors.subText }]}>Browse Categories</Text>
          <View style={styles.grid}>
            {CATEGORY_ROWS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((item) => {
                  const isInterviewPrep = item.id === '5';
                  const locked = isInterviewPrep && !canAccessInterviewPrep;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.card, { backgroundColor: colors.card }]}
                      onPress={() => {
                        if (locked) {
                          router.push('/billing');
                        } else if (item.route) {
                          router.push(item.route);
                        }
                      }}
                      activeOpacity={item.route || locked ? 0.7 : 1}
                      disabled={!item.route && !locked}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        <Text style={styles.iconText}>{item.icon}</Text>
                      </View>
                      {locked ? (
                        <View style={[styles.lockBadge, { backgroundColor: colors.border }]}>
                          <Text style={[styles.lockBadgeText, { color: colors.subText }]}>Basic</Text>
                        </View>
                      ) : null}
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.cardSubtitle, { color: colors.subText }]}>{locked ? 'Upgrade to access' : item.count}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingBottom: 100,
  },
  contentWrap: {
    paddingTop: 20,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  activeTestCard: {
    width: 200,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  activeTestAccent: {
    height: 5,
    width: '100%',
  },
  activeTestContent: {
    padding: 16,
  },
  activeTestTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoriesLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  grid: {
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    minWidth: 0,
    maxWidth: '48%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  lockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default TestScreen;