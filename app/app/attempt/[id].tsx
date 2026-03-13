import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import api from '@/lib/axios';

interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean | null;
}

interface AttemptQuestion {
  testQuestionId: string;
  questionId: string;
  questionOrder: number;
  questionText: string;
  difficulty: string | null;
  marks: number | null;
  negativeMarks: number | null;
  options: QuestionOption[];
}

interface SubmitResult {
  id: string;
  score: number;
  submittedAt: string;
}

type ScreenState = 'loading' | 'questions' | 'submitting' | 'result' | 'error';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export default function AttemptScreen() {
  const { id: attemptId } = useLocalSearchParams<{ id: string }>();
  const { theme } = themeStore(useShallow((state) => ({ theme: state.theme })));
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!attemptId) return;
    api
      .get<AttemptQuestion[]>(`/attempts/${attemptId}/questions`)
      .then((res) => {
        setQuestions(res.data);
        setScreenState('questions');
      })
      .catch(async () => {
        try {
          const attemptRes = await api.get<{ submittedAt: string | null; score: number | null }>(`/attempts/${attemptId}`);
          const data = attemptRes.data;
          if (data.submittedAt != null && data.score != null) {
            setResult({ id: attemptId, score: data.score, submittedAt: data.submittedAt });
            setScreenState('result');
            return;
          }
        } catch {
          // ignore
        }
        setErrorMsg('Failed to load questions. The attempt may have already been submitted.');
        setScreenState('error');
      });
  }, [attemptId]);

  useEffect(() => {
    if (questions.length === 0) return;
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, questions.length, progressAnim]);

  const handleSelectOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (submittedAnswers.has(questionId)) return;

      setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
      setSubmittedAnswers((prev) => new Set(prev).add(questionId));

      try {
        await api.post(`/attempts/${attemptId}/answers`, {
          questionId,
          selectedOptionId: optionId,
        });
      } catch {
        // answer save failed silently — user can still navigate
      }
    },
    [attemptId, submittedAnswers],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    setScreenState('submitting');
    try {
      const res = await api.post<SubmitResult>(`/attempts/${attemptId}/submit`);
      setResult(res.data);
      setScreenState('result');
    } catch {
      setErrorMsg('Failed to submit the test. Please try again.');
      setScreenState('error');
    }
  }, [attemptId]);

  if (screenState === 'loading') {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subText }]}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  if (screenState === 'submitting') {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subText }]}>Submitting your test...</Text>
      </SafeAreaView>
    );
  }

  if (screenState === 'error') {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.bigIcon}>⚠️</Text>
        <Text style={[styles.errorText, { color: colors.subText }]}>{errorMsg}</Text>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.outlineBtnText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screenState === 'result' && result) {
    const answeredCount = submittedAnswers.size;
    const total = questions.length;
    const skipped = total - answeredCount;
    const hasQuestions = total > 0;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.resultHero, { backgroundColor: colors.primary }]}>
            <Text style={styles.resultEmoji}>🎉</Text>
            <Text style={styles.resultTitle}>Test Submitted!</Text>
            <Text style={styles.resultSubtitle}>Here's how you did</Text>
          </View>

          <View style={[styles.scoreCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.scoreLabel, { color: colors.subText }]}>Your Score</Text>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>{result.score}</Text>
          </View>

          {hasQuestions ? (
            <View style={[styles.statsGrid, { gap: 12 }]}>
              <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                <Text style={styles.statIcon}>❓</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{total}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Total</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                <Text style={styles.statIcon}>✅</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>{answeredCount}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Answered</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                <Text style={styles.statIcon}>⏭</Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>{skipped}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Skipped</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace('/(tabs)/tests')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Back to Tests</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const selectedOption = selectedOptions[question.questionId] ?? null;
  const difficultyColor =
    DIFFICULTY_COLORS[question.difficulty?.toLowerCase() ?? ''] ?? colors.subText;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.exitBtn}>
          <Text style={[styles.exitText, { color: colors.danger }]}>Exit</Text>
        </TouchableOpacity>
        <Text style={[styles.questionCounter, { color: colors.subText }]}>
          {currentIndex + 1} / {questions.length}
        </Text>
        {question.marks != null && (
          <Text style={[styles.marksText, { color: colors.primary }]}>
            +{question.marks} pts
          </Text>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.questionScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionMeta}>
          {question.difficulty ? (
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {question.difficulty}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.questionNumber, { color: colors.subText }]}>
            Question {currentIndex + 1}
          </Text>
        </View>

        <Text style={[styles.questionText, { color: colors.text }]}>{question.questionText}</Text>

        <View style={styles.optionsList}>
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectOption(question.questionId, option.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.optionBullet,
                    {
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionBulletText,
                      { color: isSelected ? '#fff' : colors.subText },
                    ]}
                  >
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {option.optionText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.navBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.navBtn,
            { borderColor: colors.border },
            currentIndex === 0 && styles.navBtnDisabled,
          ]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navBtnText, { color: currentIndex === 0 ? colors.subText : colors.text }]}>
            ← Prev
          </Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.success }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Submit Test</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtnPrimary, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.navBtnPrimaryText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 4,
  },
  bigIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  outlineBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  exitBtn: {
    paddingVertical: 4,
  },
  exitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
  },
  marksText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  questionScroll: {
    padding: 20,
    paddingBottom: 32,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
    marginBottom: 28,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  optionBullet: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  optionBulletText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  navBtnPrimary: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  resultScroll: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  resultHero: {
    borderRadius: 22,
    padding: 36,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  scoreCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
