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

interface SamplePaper {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function SamplePapersScreen() {
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [papers, setPapers] = useState<SamplePaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SamplePaper[]>('/sample-papers/list')
      .then((res) => {
        setPapers(res.data);
        setError(null);
      })
      .catch(() => {
        setPapers([]);
        setError('Could not load sample papers.');
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: SamplePaper }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/sample-paper/${item.id}`)}
      activeOpacity={0.75}
    >
      <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
      <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
        <Text style={[styles.badgeText, { color: colors.primary }]}>Sample Paper</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.description ? (
        <Text style={[styles.desc, { color: colors.subText }]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <Text style={[styles.cta, { color: colors.primary }]}>Read by subjects & topics →</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sample Papers',
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
        ) : papers.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No sample papers available yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={papers}
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 4 },
  desc: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  cta: { fontSize: 13, fontWeight: '700' },
});
