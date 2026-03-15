import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { ThemeColors } from './types';

const PADDING_MIN = 16;
const PADDING_MAX = 24;

type NotificationHeaderProps = {
  colors: ThemeColors;
  onClose?: () => void;
};

export function NotificationHeader({ colors, onClose }: NotificationHeaderProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(
    Math.max(width * 0.05, PADDING_MIN),
    PADDING_MAX
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: horizontalPadding,
          paddingTop: 8,
          paddingBottom: 16,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {onClose && (
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
