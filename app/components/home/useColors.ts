import { useShallow } from 'zustand/react/shallow';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

export type ThemeColors = typeof lightColors;

export function useColors(): ThemeColors {
  const theme = themeStore(useShallow((state) => state.theme));
  return theme === 'dark' ? darkColors : lightColors;
}
