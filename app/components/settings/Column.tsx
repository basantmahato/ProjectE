import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type ColumnProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
};

export function Column({ children, style, gap }: ColumnProps) {
  return (
    <View style={[styles.column, gap !== undefined && { gap }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
});
