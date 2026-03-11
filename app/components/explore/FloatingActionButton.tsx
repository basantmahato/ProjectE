import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ThemeColors } from './types';

const FAB_SIZE = 56;
const FAB_MARGIN = 24;

type FloatingActionButtonProps = {
  colors: ThemeColors;
  onPress?: () => void;
};

export function FloatingActionButton({
  colors,
  onPress,
}: FloatingActionButtonProps) {
  const { width } = useWindowDimensions();
  const marginHorizontal = Math.min(Math.max(width * 0.05, 20), FAB_MARGIN);

  return (
    <View
      style={[
        styles.wrap,
        {
          right: marginHorizontal,
          bottom: marginHorizontal + 16,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
