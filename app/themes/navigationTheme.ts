import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';
  
  import { darkColors, lightColors } from '@/themes/color';
  
  export const LightTheme = {
    ...NavigationLightTheme,
    colors: {
      ...NavigationLightTheme.colors,
      background: lightColors.background,
      card: lightColors.card,
      text: lightColors.text,
      border: lightColors.border,
      primary: lightColors.primary,
    },
  };
  
  export const DarkTheme = {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      background: darkColors.background,
      card: darkColors.card,
      text: darkColors.text,
      border: darkColors.border,
      primary: darkColors.primary,
    },
  };