import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DashboardHeader } from '@/components/home';
import api from '@/lib/axios';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';

interface Subject {
  id: string;
  name: string;
  examType: string | null;
  createdAt: string;
}

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
const CONTENT_MAX_WIDTH = 600;
export default function NotesTabScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const { width } = useWindowDimensions();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
    HORIZONTAL_PADDING_MAX
  );
  const contentPadding = { paddingHorizontal: horizontalPadding };

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Subject[]>('/notes/subjects')
      .then((res) => {
        setSubjects(res.data ?? []);
        setError(null);
      })
      .catch(() => {
        setSubjects([]);
        setError('Could not load subjects.');
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/notes/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={[styles.accentStrip, { backgroundColor: colors.primary }]} />
      <View style={styles.cardInner}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.examType ? (
          <Text style={[styles.meta, { color: colors.subText }]} numberOfLines={1}>
            {item.examType}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.chevron, { color: colors.subText }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <DashboardHeader
        colors={colors}
        title="Notes"
        subtitle="Browse subjects, topics & study notes"
      />
      {loading ? (
        <View style={[styles.loaderWrap, contentPadding]}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loaderText, { color: colors.subText }]}>
            Loading subjects…
          </Text>
        </View>
      ) : error ? (
        <View style={[styles.emptyWrap, contentPadding]}>
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error}</Text>
          </View>
        </View>
      ) : subjects.length === 0 ? (
        <View style={[styles.emptyWrap, contentPadding]}>
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No subjects yet. Check back later.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, contentPadding]}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 32,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
  },
  emptyWrap: {
    flex: 1,
    paddingTop: 20,
  },
  empty: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardInner: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    paddingRight: 14,
  },
});
