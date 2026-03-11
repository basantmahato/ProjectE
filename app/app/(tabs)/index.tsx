import {
  BalanceCard,
  DashboardHeader,
  TodayStatsSection,
} from '@/components/home';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import React from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
const CONTENT_MAX_WIDTH = 600;

export default function HomeScreen() {
  const { theme } = themeStore(
    useShallow((state) => ({
      theme: state.theme,
    }))
  );
  const { width } = useWindowDimensions();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
    HORIZONTAL_PADDING_MAX
  );
  const contentPadding = { paddingHorizontal: horizontalPadding };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DashboardHeader colors={colors} userName="Jakes" />
          <View style={[styles.contentWrap, contentPadding]}>
            <BalanceCard colors={colors} />
            <TodayStatsSection colors={colors} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 32,
  },
  contentWrap: {
    paddingTop: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center' as const,
    width: '100%',
  },
});
