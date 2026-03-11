/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof lightColors & keyof typeof darkColors
) {
  const theme = themeStore((state) => state.theme);
  const colorFromProps = props[theme === 'dark' ? 'dark' : 'light'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return theme === 'dark' ? darkColors[colorName] : lightColors[colorName];
  }
}
