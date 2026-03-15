import React from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
} from 'react-native';
import type { NotificationItem, ThemeColors } from './types';
import { NotificationCard } from './NotificationCard';

const CONTENT_MAX_WIDTH = 600;
const PADDING_MIN = 16;
const PADDING_MAX = 24;

type NotificationListProps = {
  data: NotificationItem[];
  colors: ThemeColors;
  expandedId: string | null;
  onItemPress?: (item: NotificationItem) => void;
  ListEmptyComponent?: React.ReactElement | null;
};

export function NotificationList({
  data,
  colors,
  expandedId,
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

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View style={styles.itemWrap}>
        <NotificationCard
          item={item}
          colors={colors}
          isExpanded={isExpanded}
          onPress={() => onItemPress?.(item)}
        />
        {isExpanded && (
          <View style={[styles.dropdownBody, { backgroundColor: colors.border + '30' }]}>
            <Text style={[styles.dropdownText, { color: colors.text }]}>
              {item.message ?? item.title ?? 'No content'}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
  itemWrap: {
    marginBottom: 10,
  },
  dropdownBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  dropdownText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
