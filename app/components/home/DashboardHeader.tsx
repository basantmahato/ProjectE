import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ThemeColors } from './useColors';

type DashboardHeaderProps = {
  colors: ThemeColors;
  userName?: string;
  unreadCount?: number;
  /** When provided, shown instead of greeting (e.g. "Practice Arena") */
  title?: string;
  /** When provided with title, shown as subtitle (e.g. "Select a category to begin your prep") */
  subtitle?: string;
};

export function DashboardHeader({
  colors,
  userName = 'User',
  unreadCount = 0,
  title: customTitle,
  subtitle: customSubtitle,
}: DashboardHeaderProps) {
  const router = useRouter();
  const title = customTitle ?? `Hi, ${userName}!`;
  const subtitle = customSubtitle ?? 'Welcome back';

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Notification icon fixed in top-right so content changes don't affect its position */}
      <TouchableOpacity
        style={[styles.bellWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
        activeOpacity={0.7}
        onPress={() => router.push('/notifications')}
      >
        <MaterialIcons name="notifications" size={22} color="#fff" />
        {unreadCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.danger }]} />
        ) : null}
      </TouchableOpacity>
      <View style={styles.greetingBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const BELL_SIZE = 44;
const HORIZONTAL_PADDING = 20;

const styles = StyleSheet.create({
  container: {
    minHeight: 88,
    paddingTop: 8,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  greetingBlock: {
    paddingRight: BELL_SIZE + 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bellWrap: {
    position: 'absolute',
    top: 8,
    right: HORIZONTAL_PADDING,
    width: BELL_SIZE,
    height: BELL_SIZE,
    borderRadius: BELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
