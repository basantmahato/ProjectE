import type { NotificationItem } from '@/components/notification';
import {
  NotificationHeader,
  NotificationList,
} from '@/components/notification';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import api from '@/lib/axios';
import { authStore } from '@/store/authStore';
import { timeAgo } from '@/lib/timeAgo';

interface ApiNotification {
  id: string;
  title: string;
  body: string | null;
  type: string | null;
  /** API may send camelCase or snake_case */
  createdAt?: string;
  created_at?: string;
  /** Set when user is authenticated; from DB */
  read?: boolean;
}

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

function mapApiToItem(n: ApiNotification, isSeenLocally: (id: string) => boolean): NotificationItem {
  const type = (n.type ?? 'info') as NotificationItem['type'];
  const rawDate = n.createdAt ?? n.created_at;
  const read = n.read === true || isSeenLocally(n.id);
  return {
    id: n.id,
    title: n.title,
    message: n.body ?? undefined,
    timeAgo: rawDate ? timeAgo(rawDate) : 'Just now',
    status: read ? 'read' : 'unread',
    type: ['info', 'success', 'warning', 'transaction'].includes(type) ? type : 'info',
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = themeStore(
    useShallow((state) => ({ theme: state.theme }))
  );
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const markNotificationSeen = authStore((s) => s.markNotificationSeen);
  const isAuthenticated = authStore((s) => s.isAuthenticated);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiNotification[]>('/notifications');
        if (!cancelled) {
          const isSeen = authStore.getState().isNotificationSeen;
          setNotifications((res.data ?? []).map((n) => mapApiToItem(n, isSeen)));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load notifications');
          setNotifications([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleItemPress = useCallback(
    (item: NotificationItem) => {
      setExpandedId((prev) => (prev === item.id ? null : item.id));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, status: 'read' as const } : n
        )
      );
      markNotificationSeen(item.id);
      if (isAuthenticated) {
        api.post(`/notifications/${item.id}/read`).catch(() => {});
      }
    },
    [markNotificationSeen, isAuthenticated]
  );

  const emptyComponent = useMemo(
    () => (notifications.length === 0 && !loading && !error ? <EmptyNotifications colors={colors} /> : null),
    [notifications.length, loading, error, colors]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <NotificationHeader colors={colors} onClose={handleClose} />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.subText }]}>{error}</Text>
        </View>
      ) : (
        <NotificationList
          data={notifications}
          colors={colors}
          expandedId={expandedId}
          onItemPress={handleItemPress}
          ListEmptyComponent={emptyComponent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
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
