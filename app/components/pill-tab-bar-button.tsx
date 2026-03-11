import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

export function PillTabBarButton(props: BottomTabBarButtonProps) {
  const theme = themeStore(useShallow((state) => state.theme));
  const colors = theme === 'dark' ? darkColors : lightColors;
  const focused = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      style={[props.style, styles.outer]}
    >
      <View style={styles.wrapper}>
        {focused && (
          <View
            style={[StyleSheet.absoluteFill, styles.pill, { backgroundColor: colors.card }]}
          />
        )}
        <View style={styles.content}>{props.children}</View>
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderRadius: 999,
    marginVertical: 6,
    marginHorizontal: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
