import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';
import { authStore } from '@/store/authStore';

interface PublishedTest {
  id: string;
  title: string;
  totalMarks: number;
}

interface TestAttempt {
  id: string;
  testId: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
}

interface PerformanceRow {
  testId: string;
  attemptId: string;
  title: string;
  marksObtained: number;
  fullMarks: number;
  accuracyPercent: number;
  submittedAt: string;
}

const ACCENT = '#ec4899';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PerformanceScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setRows([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      api.get<PublishedTest[]>('/tests/published'),
      api.get<TestAttempt[]>('/attempts'),
    ])
      .then(([testsRes, attemptsRes]) => {
        const tests = testsRes.data;
        const attempts = attemptsRes.data;
        const testMap = new Map(tests.map((t) => [t.id, t]));

        const submittedAttempts = attempts.filter((a) => a.submittedAt != null && a.score != null);
        const latestByTest = new Map<string, TestAttempt>();
        for (const a of submittedAttempts) {
          const existing = latestByTest.get(a.testId);
          if (
            !existing ||
            new Date(a.submittedAt!).getTime() > new Date(existing.submittedAt!).getTime()
          ) {
            latestByTest.set(a.testId, a);
          }
        }

        const list: PerformanceRow[] = [];
        for (const [testId, attempt] of latestByTest) {
          const test = testMap.get(testId);
          if (!test || attempt.score == null || attempt.submittedAt == null) continue;
          const fullMarks = test.totalMarks;
          const marksObtained = attempt.score;
          const accuracyPercent = fullMarks > 0 ? Math.round((marksObtained / fullMarks) * 100) : 0;
          list.push({
            testId,
            attemptId: attempt.id,
            title: test.title,
            marksObtained,
            fullMarks,
            accuracyPercent,
            submittedAt: attempt.submittedAt,
          });
        }
        list.sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        setRows(list);
      })
      .catch(() => {
        setRows([]);
        setError('Could not load performance stats.');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const renderItem = ({ item }: { item: PerformanceRow }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.accentBar, { backgroundColor: ACCENT }]} />
      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {item.accuracyPercent}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Accuracy</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {item.marksObtained} / {item.fullMarks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Marks</Text>
          </View>
        </View>
        <Text style={[styles.dateText, { color: colors.subText }]}>
          Submitted {formatDate(item.submittedAt)}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Performance Stats',
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
          <ActivityIndicator color={ACCENT} style={styles.loader} />
        ) : !isAuthenticated ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              Sign in to view your performance stats.
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error}</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📈</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No tests attempted yet. Complete a test to see your performance here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rows}
            renderItem={renderItem}
            keyExtractor={(item) => item.attemptId}
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
  emptyIcon: { fontSize: 32, marginBottom: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: { height: 4, width: '100%' },
  cardBody: { padding: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 12, marginTop: 4 },
});
