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

interface UpcomingTest {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  scheduledAt: string;
  expiresAt: string | null;
}

const ACCENT = '#10b981';

function useCountdown(targetIso: string) {
  const getRemaining = () => {
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return null;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return remaining;
}

function CountdownBadge({ scheduledAt }: { scheduledAt: string }) {
  const r = useCountdown(scheduledAt);
  if (!r) {
    return (
      <View style={[countdownStyles.badge, { backgroundColor: ACCENT + '20' }]}>
        <Text style={[countdownStyles.text, { color: ACCENT }]}>Starting now</Text>
      </View>
    );
  }
  const parts: string[] = [];
  if (r.days > 0) parts.push(`${r.days}d`);
  if (r.hours > 0) parts.push(`${r.hours}h`);
  if (r.minutes > 0) parts.push(`${r.minutes}m`);
  if (r.days === 0) parts.push(`${r.seconds}s`);
  return (
    <View style={[countdownStyles.badge, { backgroundColor: ACCENT + '20' }]}>
      <View style={[countdownStyles.dot, { backgroundColor: ACCENT }]} />
      <Text style={[countdownStyles.text, { color: ACCENT }]}>
        Starts in {parts.join(' ')}
      </Text>
    </View>
  );
}

const countdownStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700' },
});

export default function UpcomingTestsScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [tests, setTests] = useState<UpcomingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<UpcomingTest[]>('/tests/upcoming')
      .then((res) => {
        setTests(res.data);
        setError(null);
      })
      .catch(() => {
        setTests([]);
        setError('Could not load upcoming tests.');
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: UpcomingTest }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.topBar, { backgroundColor: ACCENT }]} />
      <View style={styles.body}>
        <CountdownBadge scheduledAt={item.scheduledAt} />
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
        </View>
        {item.expiresAt && (
          <Text style={[styles.expiry, { color: colors.subText }]}>
            Closes{' '}
            {new Date(item.expiresAt).toLocaleString(undefined, {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Upcoming Tests',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        {loading ? (
          <ActivityIndicator color={ACCENT} style={styles.loader} />
        ) : error ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error}</Text>
          </View>
        ) : tests.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No upcoming tests scheduled
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topBar: { height: 5, width: '100%' },
  body: { padding: 18, gap: 10 },
  title: { fontSize: 17, fontWeight: '700', lineHeight: 23 },
  desc: { fontSize: 13, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  expiry: { fontSize: 12, marginTop: 2 },
});
