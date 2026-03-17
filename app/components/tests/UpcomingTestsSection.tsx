import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { darkColors, lightColors } from '@/themes/color';

interface UpcomingTest {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  scheduledAt: string;
  expiresAt: string | null;
}

interface Props {
  tests: UpcomingTest[];
  loading: boolean;
  error: string | null;
  colors: typeof lightColors | typeof darkColors;
}

function useCountdown(targetIso: string) {
  const getRemaining = () => {
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return null;
    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
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

function CountdownBadge({ scheduledAt, colors }: { scheduledAt: string; colors: Props['colors'] }) {
  const r = useCountdown(scheduledAt);

  if (!r) {
    return (
      <View style={[styles.countdownBadge, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.countdownText, { color: colors.primary }]}>Starting now</Text>
      </View>
    );
  }

  const parts: string[] = [];
  if (r.days > 0)    parts.push(`${r.days}d`);
  if (r.hours > 0)   parts.push(`${r.hours}h`);
  if (r.minutes > 0) parts.push(`${r.minutes}m`);
  if (r.days === 0)  parts.push(`${r.seconds}s`);

  return (
    <View style={[styles.countdownBadge, { backgroundColor: colors.primary + '20' }]}>
      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.countdownText, { color: colors.primary }]}>
        Starts in {parts.join(' ')}
      </Text>
    </View>
  );
}

export function UpcomingTestsSection({ tests, loading, error, colors }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(220, Math.max(180, width * 0.55));

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Tests</Text>
        {!loading && !error && (
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {tests.length} scheduled
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={[styles.emptyText, { color: colors.subText }]}>{error}</Text>
        </View>
      ) : tests.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={[styles.emptyText, { color: colors.subText }]}>No upcoming tests scheduled</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {tests.map((test) => (
            <View
              key={test.id}
              style={[styles.card, { width: cardWidth, backgroundColor: colors.card }]}
            >
              <View style={[styles.topBar, { backgroundColor: colors.primary }]} />
              <View style={styles.cardBody}>
                <CountdownBadge scheduledAt={test.scheduledAt} colors={colors} />

                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                  {test.title}
                </Text>

                {test.description ? (
                  <Text style={[styles.description, { color: colors.subText }]} numberOfLines={2}>
                    {test.description}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={[styles.pill, { backgroundColor: colors.border }]}>
                    <Text style={[styles.pillText, { color: colors.subText }]}>
                      {test.durationMinutes} min
                    </Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: colors.border }]}>
                    <Text style={[styles.pillText, { color: colors.subText }]}>
                      {test.totalMarks} marks
                    </Text>
                  </View>
                </View>

                {test.expiresAt && (
                  <Text style={[styles.expiryText, { color: colors.subText }]}>
                    Closes{' '}
                    {new Date(test.expiresAt).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 20,
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
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
  scroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    minWidth: 180,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  topBar: {
    height: 5,
    width: '100%',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expiryText: {
    fontSize: 11,
    marginTop: 2,
  },
});
