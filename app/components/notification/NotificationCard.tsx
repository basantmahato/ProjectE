import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NotificationItem, ThemeColors } from './types';

const CARD_PADDING_H = 16;
const CARD_PADDING_V = 14;
const ICON_SIZE = 44;

type NotificationCardProps = {
  item: NotificationItem;
  colors: ThemeColors;
  onPress?: () => void;
};

function getIconForType(type?: NotificationItem['type']) {
  switch (type) {
    case 'transaction':
      return 'payment';
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'warning';
    default:
      return 'notifications';
  }
}

export function NotificationCard({ item, colors, onPress }: NotificationCardProps) {
  const iconName = getIconForType(item.type);
  const isNew = item.status === 'new' || item.status === 'unread';

  const content = (
    <View style={[styles.card, { backgroundColor: colors.card, paddingVertical: CARD_PADDING_V, paddingHorizontal: CARD_PADDING_H }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '18' }]}>
        <MaterialIcons name={iconName as any} size={22} color={colors.primary} />
      </View>
      <View style={styles.textBlock}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
            !isNew && styles.titleRead,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text style={[styles.time, { color: colors.subText }]} numberOfLines={1}>
          {item.timeAgo}
        </Text>
      </View>
      {isNew && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 72,
    overflow: 'hidden',
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleRead: {
    fontWeight: '500',
    opacity: 0.85,
  },
  time: {
    fontSize: 13,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
