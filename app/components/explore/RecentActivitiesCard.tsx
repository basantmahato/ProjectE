import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ActivityItem, ThemeColors } from './types';

const CARD_PADDING_H_MIN = 16;
const CARD_PADDING_H_MAX = 24;
const CARD_PADDING_V = 20;
const DOT_SIZE = 10;

type RecentActivitiesCardProps = {
  colors: ThemeColors;
  activities: ActivityItem[];
};

export function RecentActivitiesCard({
  colors,
  activities,
}: RecentActivitiesCardProps) {
  const { width } = useWindowDimensions();
  const paddingH = Math.min(
    Math.max(width * 0.05, CARD_PADDING_H_MIN),
    CARD_PADDING_H_MAX
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          paddingHorizontal: paddingH,
          paddingVertical: CARD_PADDING_V,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Recent Activities
      </Text>
      <View style={styles.list}>
        {activities.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.activityRow,
              index < activities.length - 1 && [
                styles.activityRowBorder,
                { borderBottomColor: colors.border },
              ],
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: item.dotColor },
              ]}
            />
            <View style={styles.activityContent}>
              <Text
                style={[styles.activityTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.activityTime, { color: colors.subText }]}>
                {item.timeAgo}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  list: {},
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
});
