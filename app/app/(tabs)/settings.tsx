import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Avatar, Column, Row } from '@/components/settings';
import api from '@/lib/axios';
import { getFirstWord } from '@/lib/format';
import { registerPushTokenIfNeeded } from '@/lib/pushNotifications';
import { authStore } from '@/store/authStore';
import { notificationStore } from '@/store/notificationStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
const CONTENT_MAX_WIDTH = 500;

type SettingsRowItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  showSwitch?: boolean;
  switchType?: 'theme' | 'notification';
  showChevron?: boolean;
};

export default function Settings() {
  const { theme, toggleTheme } = themeStore(
    useShallow((state) => ({
      theme: state.theme,
      toggleTheme: state.toggleTheme,
    }))
  );
  const { user, logout } = authStore(
    useShallow((state) => ({ user: state.user, logout: state.logout }))
  );
  const notificationsEnabled = notificationStore((state) => state.enabled);
  const setNotificationsEnabled = notificationStore((state) => state.setEnabled);
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User';
  const displayNameFirstWord = getFirstWord(displayName, 'User');

  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ id: string; rank: number }[]>('/dashboard/leaderboard')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const myEntry = user?.id ? list.find((e) => e.id === user.id) : null;
        setUserRank(myEntry?.rank ?? null);
      })
      .catch(() => {
        if (!cancelled) setUserRank(null);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 24);
  const contentPadding = { paddingHorizontal: horizontalPadding };

  const settingsRows: SettingsRowItem[] = [
    { id: 'appearance', label: 'Appearance', icon: 'dark-mode', showSwitch: true, switchType: 'theme', showChevron: false },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-none', showSwitch: true, switchType: 'notification', showChevron: false },
    { id: 'bookmarks', label: 'Manage bookmarks', icon: 'bookmark-border', showChevron: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, contentPadding]}
        showsVerticalScrollIndicator={false}
      >
        <Column style={styles.mainColumn}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          </View>

          {/* Single centered avatar with rank tag */}
          <Avatar
            initial={displayNameFirstWord.charAt(0)}
            name={displayNameFirstWord}
            colors={colors}
          />
          <TouchableOpacity
            style={[styles.rankTag, { backgroundColor: colors.primary + '22' }]}
            activeOpacity={0.7}
            onPress={() => router.push('/rank')}
          >
            <MaterialIcons name="leaderboard" size={14} color={colors.primary} />
            <Text style={[styles.rankTagText, { color: colors.primary }]}>
              {userRank != null ? `Rank #${userRank}` : 'View leaderboard'}
            </Text>
          </TouchableOpacity>

          {/* Quick actions row */}
          <Row gap={12} style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={() => router.push('/billing')}
            >
              <MaterialIcons name="payment" size={24} color={colors.text} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Billing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={() => {
                if (!user) {
                  router.push('/(auth)/login');
                } else {
                  router.push('/profile-settings');
                }
              }}
            >
              <MaterialIcons name="person-outline" size={24} color={colors.text} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Profile</Text>
            </TouchableOpacity>
          </Row>

          {/* Settings list card */}
          <Column style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            {settingsRows.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingsRowTouch,
                  index < settingsRows.length - 1 && styles.settingsRowBorder,
                  { borderColor: colors.border },
                ]}
                activeOpacity={0.7}
                disabled={item.showSwitch}
                onPress={() => {
                  if (item.id === 'bookmarks') router.push('/bookmarked-blogs');
                }}
              >
                <Row gap={14} style={styles.settingsRow}>
                  <MaterialIcons name={item.icon} size={22} color={colors.text} />
                  <Text style={[styles.settingsRowLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.showSwitch && item.switchType === 'theme' ? (
                    <Switch
                      value={dark}
                      onValueChange={() => toggleTheme()}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                      ios_backgroundColor={colors.border}
                    />
                  ) : item.showSwitch && item.switchType === 'notification' ? (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={(value) => {
                        setNotificationsEnabled(value);
                        if (value && user) {
                          registerPushTokenIfNeeded().catch(() => {});
                        }
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                      ios_backgroundColor={colors.border}
                    />
                  ) : item.showChevron ? (
                    <MaterialIcons name="chevron-right" size={24} color={colors.subText} />
                  ) : null}
                </Row>
              </TouchableOpacity>
            ))}
          </Column>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutWrap}
            activeOpacity={0.7}
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
          </TouchableOpacity>
        </Column>
      </ScrollView>
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
    paddingTop: 8,
    paddingBottom: 40,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  mainColumn: {
    width: '100%',
  },
  header: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  rankTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  rankTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionsRow: {
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 88,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
  },
  settingsRowTouch: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  settingsRow: {
    flex: 1,
  },
  settingsRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsRowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutWrap: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
