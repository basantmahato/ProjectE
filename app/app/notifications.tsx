import type { NotificationItem } from '@/components/notification';
import {
  NotificationHeader,
  NotificationList,
} from '@/components/notification';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

// Mock notifications for demo
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Payment received',
    message: 'You received $40,000.00',
    timeAgo: '5m ago',
    status: 'new',
    type: 'transaction',
  },
  {
    id: '2',
    title: 'Order shipped',
    message: 'Your order has been dispatched',
    timeAgo: '50m ago',
    status: 'unread',
    type: 'success',
  },
  {
    id: '3',
    title: 'Low balance reminder',
    message: 'Consider topping up your account',
    timeAgo: 'Yesterday',
    status: 'read',
    type: 'warning',
  },
  {
    id: '4',
    title: 'New feature available',
    message: 'Check out the new dashboard',
    timeAgo: '2 days ago',
    status: 'read',
    type: 'info',
  },
];

function EmptyNotifications({ colors }: { colors: typeof lightColors }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIconWrap, { backgroundColor: colors.border }]}>
        <MaterialIcons name="notifications-none" size={40} color={colors.subText} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
      <Text style={[styles.emptySub, { color: colors.subText }]}>
        You're all caught up
      </Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = themeStore(
    useShallow((state) => ({ theme: state.theme }))
  );
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const handleFilterPress = useCallback(() => {
    // Could open a filter bottom sheet or modal here
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleItemPress = useCallback((item: NotificationItem) => {
    // Mark as read or navigate to detail
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === item.id ? { ...n, status: 'read' as const } : n
      )
    );
  }, []);

  const emptyComponent = useMemo(
    () => (notifications.length === 0 ? <EmptyNotifications colors={colors} /> : null),
    [notifications.length, colors]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <NotificationHeader colors={colors} onFilterPress={handleFilterPress} onClose={handleClose} />
      <NotificationList
        data={notifications}
        colors={colors}
        onItemPress={handleItemPress}
        ListEmptyComponent={emptyComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
  },
});
