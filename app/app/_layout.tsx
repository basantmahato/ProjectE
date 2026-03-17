import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { registerPushTokenIfNeeded } from '@/lib/pushNotifications';
import { authStore } from '@/store/authStore';
import { onboardingStore } from '@/store/onboardingStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const segments = useSegments();
  const theme = themeStore((state) => state.theme);
  const isTabScreen = segments[0] === '(tabs)';
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    authStore.getState().hydrate();
    onboardingStore.getState().hydrate();
  }, []);

  const isAuthenticated = authStore((s) => s.isAuthenticated);
  const hydrationDone = authStore((s) => s.hydrationDone);
  useEffect(() => {
    if (hydrationDone && isAuthenticated) {
      registerPushTokenIfNeeded().catch(() => {});
    }
  }, [hydrationDone, isAuthenticated]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="index"
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="test/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="attempt/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="upcoming-tests" options={{ headerShown: false }} />
          <Stack.Screen name="recent-tests" options={{ headerShown: false }} />
          <Stack.Screen name="mock-tests" options={{ headerShown: false }} />
          <Stack.Screen name="mock-test/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="sample-papers" options={{ headerShown: false }} />
          <Stack.Screen name="sample-paper/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="interview-prep" options={{ headerShown: false }} />
          <Stack.Screen name="interview-prep/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="blog" options={{ headerShown: false }} />
          <Stack.Screen name="blog/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="notes" options={{ headerShown: false }} />
          <Stack.Screen name="notes/[subjectId]" options={{ headerShown: false }} />
          <Stack.Screen name="notes/[subjectId]/[topicId]" options={{ headerShown: false }} />
          <Stack.Screen name="notes/note/[noteId]" options={{ headerShown: false }} />
          <Stack.Screen name="performance" options={{ headerShown: false }} />
          <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
          <Stack.Screen name="billing" options={{ headerShown: false }} />
          <Stack.Screen name="rank" options={{ headerShown: false }} />
          <Stack.Screen name="bookmarked-blogs" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal', title: 'Notifications' }} />
        </Stack>
        <StatusBar
          style={theme === 'dark' ? 'light' : 'dark'}
          backgroundColor={
            isTabScreen
              ? (theme === 'dark' ? darkColors.primary : lightColors.primary)
              : theme === 'dark'
                ? darkColors.background
                : lightColors.background
          }
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}