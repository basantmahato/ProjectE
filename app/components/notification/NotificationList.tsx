import React from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NotificationItem, ThemeColors } from './types';
import { NotificationCard } from './NotificationCard';

const CONTENT_MAX_WIDTH = 600;
const PADDING_MIN = 16;
const PADDING_MAX = 24;

type NotificationListProps = {
  data: NotificationItem[];
  colors: ThemeColors;
  onItemPress?: (item: NotificationItem) => void;
  ListEmptyComponent?: React.ReactElement | null;
};

export function NotificationList({
  data,
  colors,
  onItemPress,
  ListEmptyComponent,
}: NotificationListProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(
    Math.max(width * 0.05, PADDING_MIN),
    PADDING_MAX
  );
  const contentWidth = Math.min(width, CONTENT_MAX_WIDTH);
  const listPadding = {
    paddingHorizontal: horizontalPadding,
    paddingBottom: 24,
    maxWidth: contentWidth,
    alignSelf: 'center' as const,
    width: '100%',
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <NotificationCard
      item={item}
      colors={colors}
      onPress={() => onItemPress?.(item)}
    />
  );

  const keyExtractor = (item: NotificationItem) => item.id;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.listContent, listPadding]}
      style={[styles.list, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 4,
  },
});
