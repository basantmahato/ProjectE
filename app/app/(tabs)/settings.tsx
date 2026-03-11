import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Avatar, Column, Row } from '@/components/settings';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

const DISPLAY_NAME = 'User';
const CONTENT_MAX_WIDTH = 500;

type SettingsRowItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  showSwitch?: boolean;
  showChevron?: boolean;
};

export default function Settings() {
  const { theme, toggleTheme } = themeStore(
    useShallow((state) => ({
      theme: state.theme,
      toggleTheme: state.toggleTheme,
    }))
  );
  const logout = authStore((state) => state.logout);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 24);
  const contentPadding = { paddingHorizontal: horizontalPadding };

  const settingsRows: SettingsRowItem[] = [
    { id: 'appearance', label: 'Appearance', icon: 'dark-mode', showSwitch: true, showChevron: false },
    { id: 'datasaver', label: 'Datasaver', icon: 'data-usage', showChevron: true },
    { id: 'watch-history', label: 'Watch history', icon: 'history', showChevron: true },
    { id: 'notifications', label: 'Notifications', icon: 'notifications-none', showChevron: true },
    { id: 'bookmarks', label: 'Manage bookmarks', icon: 'bookmark-border', showChevron: true },
    { id: 'accessibility', label: 'Accessibility', icon: 'accessibility-new', showChevron: true },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

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

          {/* Single centered avatar */}
          <Avatar
            initial={DISPLAY_NAME.charAt(0)}
            name={DISPLAY_NAME}
            colors={colors}
          />

          {/* Quick actions row */}
          <Row gap={12} style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="download" size={24} color={colors.text} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Downloads</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="star-outline" size={24} color={colors.text} />
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>Watchlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
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
              >
                <Row gap={14} style={styles.settingsRow}>
                  <MaterialIcons name={item.icon} size={22} color={colors.text} />
                  <Text style={[styles.settingsRowLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.showSwitch ? (
                    <Switch
                      value={dark}
                      onValueChange={() => toggleTheme()}
                      trackColor={{ false: '#555', true: colors.primary }}
                      thumbColor="#fff"
                      ios_backgroundColor="#555"
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
