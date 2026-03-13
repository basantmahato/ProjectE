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
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: {},
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
