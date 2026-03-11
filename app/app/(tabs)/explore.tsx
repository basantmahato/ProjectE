import {
  AchievementsCard,
  FloatingActionButton,
  ProgressOverviewCard,
  RecentActivitiesCard,
} from '@/components/explore';
import type { AchievementItem, ActivityItem } from '@/components/explore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import { useShallow } from 'zustand/react/shallow';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
const CONTENT_MAX_WIDTH = 600;

// Purple for Team Player - theme-friendly accent (not in base palette)
const ACHIEVEMENT_PURPLE_LIGHT = '#8b5cf6';
const ACHIEVEMENT_PURPLE_DARK = '#a78bfa';

export default function ExploreScreen() {
  const { theme } = themeStore(
    useShallow((state) => ({ theme: state.theme }))
  );
  const { width } = useWindowDimensions();
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const horizontalPadding = Math.min(
    Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
    HORIZONTAL_PADDING_MAX
  );
  const contentPadding = { paddingHorizontal: horizontalPadding };

  const achievements: AchievementItem[] = useMemo(
    () => [
      {
        id: '1',
        label: 'Perfect Attendance',
        icon: 'star',
        accentColor: colors.accent,
      },
      {
        id: '2',
        label: 'Code Master',
        icon: 'code',
        accentColor: colors.primary,
      },
      {
        id: '3',
        label: 'Top Student',
        icon: 'emoji-events',
        accentColor: colors.success,
      },
      {
        id: '4',
        label: 'Team Player',
        icon: 'workspace-premium',
        accentColor: dark ? ACHIEVEMENT_PURPLE_DARK : ACHIEVEMENT_PURPLE_LIGHT,
      },
    ],
    [colors.accent, colors.primary, colors.success, dark]
  );

  const activities: ActivityItem[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Completed JavaScript Quiz',
        timeAgo: '2 hours ago',
        dotColor: colors.success,
      },
      {
        id: '2',
        title: 'Submitted CSS Project',
        timeAgo: 'Yesterday',
        dotColor: colors.primary,
      },
      {
        id: '3',
        title: 'Attended HTML Workshop',
        timeAgo: '2 days ago',
        dotColor: dark ? ACHIEVEMENT_PURPLE_DARK : ACHIEVEMENT_PURPLE_LIGHT,
      },
    ],
    [colors.success, colors.primary, dark]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrap, contentPadding]}>
          <ProgressOverviewCard
            colors={colors}
            attendancePercent={85}
            points={750}
          />
          <AchievementsCard colors={colors} achievements={achievements} />
          <RecentActivitiesCard colors={colors} activities={activities} />
        </View>
      </ScrollView>
      <FloatingActionButton colors={colors} onPress={() => {}} />
    </SafeAreaView>
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
    paddingTop: 24,
    paddingBottom: 100,
  },
  contentWrap: {
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
});
