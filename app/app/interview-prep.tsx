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
import { AxiosError } from 'axios';

interface JobRole {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

const ACCENT = '#8b5cf6';

export default function InterviewPrepScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    api
      .get<JobRole[]>('/interview-prep/list')
      .then((res) => {
        setJobRoles(res.data);
        setError(null);
        setUpgradeRequired(false);
      })
      .catch((err: AxiosError<{ code?: string; message?: string }>) => {
        setJobRoles([]);
        const isPlanUpgrade = err.response?.status === 403 && err.response?.data?.code === 'PLAN_UPGRADE_REQUIRED';
        setUpgradeRequired(isPlanUpgrade);
        setError(isPlanUpgrade ? 'Upgrade to Basic to access Interview Prep.' : 'Could not load job roles.');
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: JobRole }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/interview-prep/${item.id}`)}
      activeOpacity={0.75}
    >
      <View style={[styles.accentBar, { backgroundColor: ACCENT }]} />
      <View style={[styles.badge, { backgroundColor: ACCENT + '22' }]}>
        <Text style={[styles.badgeText, { color: ACCENT }]}>Job Role</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>
      {item.description ? (
        <Text style={[styles.desc, { color: colors.subText }]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <Text style={[styles.cta, { color: ACCENT }]}>View topics & subtopics →</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Interview Prep',
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
        ) : error ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error}</Text>
            {upgradeRequired ? (
              <TouchableOpacity
                style={[styles.upgradeBtn, { backgroundColor: ACCENT }]}
                onPress={() => router.push('/billing')}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeBtnText}>Upgrade plan</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : jobRoles.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No job roles available yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={jobRoles}
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
  emptyText: { fontSize: 15, textAlign: 'center', marginBottom: 16 },
  upgradeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
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
  accentBar: { height: 5, width: '100%' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 17, fontWeight: '700', lineHeight: 23, marginBottom: 6 },
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  cta: { fontSize: 14, fontWeight: '700' },
});
