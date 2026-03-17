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
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

interface MockTest {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  isMock: boolean;
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

export default function MockTestsScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [tests, setTests] = useState<MockTest[]>([]);
  const [attemptByTestId, setAttemptByTestId] = useState<Map<string, TestAttempt>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const pTests = api
      .get<MockTest[]>('/mock-tests/published')
      .then((res) => {
        setTests(res.data);
        setError(null);
      })
      .catch(() => {
        setTests([]);
        setError('Could not load mock tests.');
      });

    const pAttempts = api
      .get<TestAttempt[]>('/attempts')
      .then((res) => {
        const byTestId = new Map<string, TestAttempt>();
        for (const attempt of res.data) {
          const existing = byTestId.get(attempt.testId);
          if (
            !existing ||
            new Date(attempt.startedAt) > new Date(existing.startedAt)
          ) {
            byTestId.set(attempt.testId, attempt);
          }
        }
        setAttemptByTestId(byTestId);
      })
      .catch(() => setAttemptByTestId(new Map()));

    Promise.all([pTests, pAttempts]).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const renderItem = ({ item }: { item: MockTest }) => {
    const attempt = attemptByTestId.get(item.id);
    const isDone = attempt?.submittedAt != null;
    const scorePercent =
      isDone && attempt?.score != null && item.totalMarks > 0
        ? Math.round((attempt.score / item.totalMarks) * 100)
        : null;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() =>
          isDone && attempt
            ? router.push(`/attempt/${attempt.id}`)
            : router.push(`/mock-test/${item.id}`)
        }
        activeOpacity={0.75}
      >
        <View style={[styles.accentBar, { backgroundColor: isDone ? colors.success : colors.primary }]} />
        <View style={styles.badgeRow}>
          <View style={[styles.mockBadge, { backgroundColor: (isDone ? colors.success : colors.primary) + '22' }]}>
            <Text style={[styles.mockBadgeText, { color: isDone ? colors.success : colors.primary }]}>
              {isDone ? 'Done' : 'Mock Test'}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[styles.desc, { color: colors.subText }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={[styles.pill, { backgroundColor: colors.border }]}>
            <Text style={[styles.pillText, { color: colors.subText }]}>
              {item.durationMinutes} min
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: colors.border }]}>
            <Text style={[styles.pillText, { color: colors.subText }]}>
              {item.totalMarks} marks
            </Text>
          </View>
          {isDone && scorePercent != null ? (
            <View style={[styles.pill, { backgroundColor: (scorePercent >= 60 ? colors.success : colors.danger) + '22' }]}>
              <Text style={[styles.pillText, { color: scorePercent >= 60 ? colors.success : colors.danger }]}>
                {attempt!.score}/{item.totalMarks}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.cta, { color: isDone ? colors.success : colors.primary }]}>
          {isDone ? 'View result →' : 'Attempt now →'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mock Tests',
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
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error}</Text>
          </View>
        ) : tests.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No mock tests available yet
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
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    height: 4,
    width: '100%',
    marginHorizontal: -16,
    marginBottom: 0,
  },
  badgeRow: { flexDirection: 'row', marginTop: 10, marginBottom: 2 },
  mockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  mockBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  cta: { fontSize: 13, fontWeight: '700' },
});
