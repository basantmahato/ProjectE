import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type RowProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
};

export function Row({ children, style, gap = 12 }: RowProps) {
  return (
    <View style={[styles.row, gap !== undefined && { gap }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
