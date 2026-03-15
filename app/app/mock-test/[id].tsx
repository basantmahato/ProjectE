import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AxiosError } from 'axios';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

interface MockTestDetail {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number;
  isPublished: boolean;
  isMock: boolean;
  createdAt: string;
}

const MOCK_ACCENT = '#f59e0b';

const INFO_ITEMS = (test: MockTestDetail) => [
  { label: 'Duration', value: `${test.durationMinutes} minutes`, icon: '⏱' },
  { label: 'Total Marks', value: `${test.totalMarks}`, icon: '🏆' },
  { label: 'No schedule', value: 'Attempt anytime', icon: '📝' },
];

export default function MockTestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [test, setTest] = useState<MockTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<MockTestDetail>(`/mock-tests/published/${id}`)
      .then((res) => setTest(res.data))
      .catch(() => setError('Failed to load mock test.'))
      .finally(() => setLoading(false));
  }, [id]);

  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const handleStartTest = useCallback(async () => {
    if (!test || starting) return;
    setStarting(true);
    setUpgradeRequired(false);
    try {
      const res = await api.post<{ id: string }>('/attempts', { testId: test.id });
      const attemptId = res.data.id;
      router.replace(`/attempt/${attemptId}`);
    } catch (err) {
      const ax = err as AxiosError<{ code?: string; message?: string }>;
      const isPlanUpgrade = ax.response?.status === 403 && ax.response?.data?.code === 'PLAN_UPGRADE_REQUIRED';
      setUpgradeRequired(isPlanUpgrade);
      setError(isPlanUpgrade ? (ax.response?.data?.message ?? 'Free plan limit reached. Upgrade for more attempts.') : 'Could not start the mock test. Please try again.');
    } finally {
      setStarting(false);
    }
  }, [test, starting]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={MOCK_ACCENT} />
      </SafeAreaView>
    );
  }

  if (error || !test) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.subText }]}>{error ?? 'Mock test not found.'}</Text>
        {upgradeRequired ? (
          <TouchableOpacity
            style={[styles.upgradeBtn, { backgroundColor: MOCK_ACCENT }]}
            onPress={() => router.push('/billing')}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeBtnText}>Upgrade plan</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backBtnText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIconBtn}>
          <Text style={[styles.backIcon, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: MOCK_ACCENT }]}>
          <Text style={styles.heroBadge}>Mock Test</Text>
          <Text style={styles.heroTitle}>{test.title}</Text>
        </View>

        {test.description ? (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionLabel, { color: colors.subText }]}>About this mock test</Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>{test.description}</Text>
          </View>
        ) : null}

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>Details</Text>
          {INFO_ITEMS(test).map((item) => (
            <View
              key={item.label}
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.infoLeft}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <Text style={[styles.infoLabel, { color: colors.subText }]}>{item.label}</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.noteCard, { backgroundColor: MOCK_ACCENT + '18' }]}>
          <Text style={styles.noteIcon}>💡</Text>
          <Text style={[styles.noteText, { color: colors.text }]}>
            Mock tests have no schedule — start whenever you're ready. Complete all questions and submit before time runs out.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            { backgroundColor: MOCK_ACCENT },
            starting && styles.startBtnDisabled,
          ]}
          onPress={handleStartTest}
          disabled={starting}
          activeOpacity={0.85}
        >
          {starting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>Start Mock Test</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorIcon: { fontSize: 40 },
  errorText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 32 },
  upgradeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backIconBtn: { paddingVertical: 4 },
  backIcon: { fontSize: 15, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  heroCard: { borderRadius: 22, padding: 28, paddingBottom: 32 },
  heroBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 34 },
  section: { borderRadius: 18, padding: 20, gap: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  descriptionText: { fontSize: 15, lineHeight: 22 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { fontSize: 18 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 15, fontWeight: '700' },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noteIcon: { fontSize: 18, marginTop: 2 },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20 },
  footer: { padding: 20, borderTopWidth: 1 },
  startBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  startBtnDisabled: { opacity: 0.6 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
