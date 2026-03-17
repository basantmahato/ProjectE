import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AxiosError } from 'axios';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

interface Subtopic {
  id: string;
  name: string;
  explanation: string | null;
  orderIndex: number;
}

interface Topic {
  id: string;
  name: string;
  explanation: string | null;
  orderIndex: number;
  subtopics: Subtopic[];
}

interface JobRoleDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  topics: Topic[];
}

export default function InterviewPrepRoleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [role, setRole] = useState<JobRoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<JobRoleDetail>(`/interview-prep/read/${id}`)
      .then((res) => {
        setRole(res.data);
        setError(null);
        setUpgradeRequired(false);
      })
      .catch((err: AxiosError<{ code?: string; message?: string }>) => {
        setRole(null);
        const isPlanUpgrade = err.response?.status === 403 && err.response?.data?.code === 'PLAN_UPGRADE_REQUIRED';
        setUpgradeRequired(isPlanUpgrade);
        setError(isPlanUpgrade ? 'Upgrade to Basic to access Interview Prep.' : 'Could not load job role.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Interview Prep', headerBackTitle: 'Back' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        </SafeAreaView>
      </>
    );
  }

  if (error || !role) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Interview Prep', headerBackTitle: 'Back' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error ?? 'Not found'}</Text>
            {upgradeRequired ? (
              <TouchableOpacity
                style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/billing')}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeBtnText}>Upgrade plan</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: role.name,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.roleCard, { backgroundColor: colors.card }]}>
            <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
            <Text style={[styles.roleTitle, { color: colors.text }]}>{role.name}</Text>
            {role.description ? (
              <Text style={[styles.roleDesc, { color: colors.subText }]}>{role.description}</Text>
            ) : null}
          </View>

          {role.topics.map((topic) => (
            <View key={topic.id} style={styles.section}>
              <View style={[styles.topicHeader, { backgroundColor: colors.primary + '18', borderLeftColor: colors.primary }]}>
                <Text style={[styles.topicTitle, { color: colors.text }]}>{topic.name}</Text>
              </View>
              {topic.explanation ? (
                <View style={[styles.explanationBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.explanationLabel, { color: colors.primary }]}>Explanation</Text>
                  <Text style={[styles.explanationText, { color: colors.text }]}>{topic.explanation}</Text>
                </View>
              ) : null}

              {topic.subtopics.map((sub) => (
                <View key={sub.id} style={styles.subtopicBlock}>
                  <Text style={[styles.subtopicTitle, { color: colors.primary }]}>{sub.name}</Text>
                  {sub.explanation ? (
                    <View style={[styles.subExplanation, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <Text style={[styles.subExplanationText, { color: colors.text }]}>{sub.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
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
  roleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 24,
    padding: 20,
    paddingTop: 24,
  },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  roleTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  roleDesc: { fontSize: 14, lineHeight: 21 },
  section: { marginBottom: 28 },
  topicHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  topicTitle: { fontSize: 18, fontWeight: '700' },
  explanationBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  explanationLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  explanationText: { fontSize: 14, lineHeight: 21 },
  subtopicBlock: { marginBottom: 16, marginLeft: 8 },
  subtopicTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  subExplanation: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  subExplanationText: { fontSize: 14, lineHeight: 20 },
});
