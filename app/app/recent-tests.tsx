import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

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

interface RecentTest extends PublishedTest {
  attemptId: string;
  score: number | null;
  submittedAt: string | null;
  startedAt: string;
}

const ACCENT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function RecentTestsScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [tests, setTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          if (
            !existing ||
            new Date(attempt.startedAt) > new Date(existing.startedAt)
          ) {
            attemptByTestId.set(attempt.testId, attempt);
          }
        }

        const recent: RecentTest[] = [];
        for (const test of allTests) {
          const attempt = attemptByTestId.get(test.id);
          if (attempt) {
            recent.push({
              ...test,
              attemptId: attempt.id,
              score: attempt.score,
              submittedAt: attempt.submittedAt,
              startedAt: attempt.startedAt,
            });
          }
        }
        recent.sort(
          (a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
        setTests(recent);
        setError(null);
      })
      .catch(() => {
        setTests([]);
        setError('Could not load recent tests.');
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item, index }: { item: RecentTest; index: number }) => {
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const scorePercent =
      item.score != null && item.totalMarks > 0
        ? Math.round((item.score / item.totalMarks) * 100)
        : null;
    const isSubmitted = !!item.submittedAt;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/test/${item.id}`)}
        activeOpacity={0.75}
      >
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {isSubmitted && scorePercent != null ? (
              <View
                style={[
                  styles.scoreBadge,
                  {
                    backgroundColor:
                      scorePercent >= 60 ? '#10b98120' : '#ef444420',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scoreText,
                    { color: scorePercent >= 60 ? '#10b981' : '#ef4444' },
                  ]}
                >
                  {item.score}/{item.totalMarks}
                </Text>
              </View>
            ) : (
              <View style={[styles.scoreBadge, { backgroundColor: '#f59e0b20' }]}>
                <Text style={[styles.scoreText, { color: '#f59e0b' }]}>
                  In Progress
                </Text>
              </View>
            )}
          </View>
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: colors.subText }]}>
              {item.durationMinutes} min · {item.totalMarks} marks
            </Text>
            <Text style={[styles.metaText, { color: colors.subText }]}>
              {formatDate(item.startedAt)}
            </Text>
          </View>
          <Text style={[styles.cta, { color: accent }]}>Retry →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Recent Tests',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['bottom']}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              {error}
            </Text>
          </View>
        ) : tests.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No tests attempted yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={tests}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  empty: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 15 },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: { width: 4 },
  body: { flex: 1, padding: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  title: { flex: 1, fontSize: 16, fontWeight: '700' },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  scoreText: { fontSize: 12, fontWeight: '700' },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaText: { fontSize: 12 },
  cta: { fontSize: 12, fontWeight: '700' },
});
