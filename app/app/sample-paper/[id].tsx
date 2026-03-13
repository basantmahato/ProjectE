import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  explanation: string | null;
  orderIndex: number;
  options: Option[];
}

interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

interface SamplePaperDetail {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  subjects: Subject[];
}

const ACCENT = '#3b82f6';
const CORRECT = '#22c55e';

export default function SamplePaperReadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [paper, setPaper] = useState<SamplePaperDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<SamplePaperDetail>(`/sample-papers/read/${id}`)
      .then((res) => {
        setPaper(res.data);
        setError(null);
      })
      .catch(() => {
        setPaper(null);
        setError('Could not load sample paper.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Sample Paper', headerBackTitle: 'Back' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <ActivityIndicator color={ACCENT} style={styles.loader} />
        </SafeAreaView>
      </>
    );
  }

  if (error || !paper) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Sample Paper', headerBackTitle: 'Back' }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
          <View style={[styles.empty, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{error ?? 'Not found'}</Text>
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
          title: paper.title,
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
          <View style={[styles.paperCard, { backgroundColor: colors.card }]}>
            <View style={[styles.accentBar, { backgroundColor: ACCENT }]} />
            <Text style={[styles.paperTitle, { color: colors.text }]}>{paper.title}</Text>
            {paper.description ? (
              <Text style={[styles.paperDesc, { color: colors.subText }]}>{paper.description}</Text>
            ) : null}
          </View>

          {paper.subjects.map((subject) => (
            <View key={subject.id} style={styles.section}>
              <View style={[styles.subjectHeader, { backgroundColor: ACCENT + '18', borderLeftColor: ACCENT }]}>
                <Text style={[styles.subjectTitle, { color: colors.text }]}>{subject.name}</Text>
              </View>

              {subject.topics.map((topic) => (
                <View key={topic.id} style={styles.topicBlock}>
                  <Text style={[styles.topicTitle, { color: colors.primary }]}>{topic.name}</Text>

                  {topic.questions.map((q, qIndex) => (
                    <View key={q.id} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.qLabel, { color: colors.subText }]}>Q{qIndex + 1}</Text>
                      <Text style={[styles.questionText, { color: colors.text }]}>{q.questionText}</Text>

                      <View style={styles.optionsList}>
                        {q.options.map((opt) => (
                          <View
                            key={opt.id}
                            style={[
                              styles.optionRow,
                              { backgroundColor: opt.isCorrect ? CORRECT + '18' : colors.background },
                              opt.isCorrect && { borderLeftColor: CORRECT },
                            ]}
                          >
                            <Text style={[styles.optionText, { color: colors.text }]}>{opt.optionText}</Text>
                            {opt.isCorrect && (
                              <Text style={[styles.correctBadge, { color: CORRECT }]}>✓ Correct</Text>
                            )}
                          </View>
                        ))}
                      </View>

                      {q.explanation ? (
                        <View style={[styles.explanationBox, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '40' }]}>
                          <Text style={[styles.explanationLabel, { color: colors.primary }]}>Explanation</Text>
                          <Text style={[styles.explanationText, { color: colors.text }]}>{q.explanation}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
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
  emptyText: { fontSize: 15 },
  paperCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 24,
    padding: 20,
    paddingTop: 24,
  },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  paperTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  paperDesc: { fontSize: 14, lineHeight: 21 },
  section: { marginBottom: 28 },
  subjectHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  subjectTitle: { fontSize: 18, fontWeight: '700' },
  topicBlock: { marginBottom: 20 },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  questionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  qLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  questionText: { fontSize: 15, lineHeight: 22, marginBottom: 14 },
  optionsList: { gap: 8, marginBottom: 12 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  optionText: { fontSize: 14, flex: 1 },
  correctBadge: { fontSize: 12, fontWeight: '700', marginLeft: 8 },
  explanationBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  explanationLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  explanationText: { fontSize: 14, lineHeight: 20 },
});
