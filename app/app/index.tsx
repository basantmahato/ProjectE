import { Redirect } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { View } from 'react-native';

import { authStore } from '@/store/authStore';
import { onboardingStore } from '@/store/onboardingStore';

function useAuthHydrationDone() {
  return useSyncExternalStore(
    (cb) => authStore.subscribe(cb),
    () => authStore.getState().hydrationDone,
    () => false
  );
}

function useOnboardingHydrationDone() {
  return useSyncExternalStore(
    (cb) => onboardingStore.subscribe(cb),
    () => onboardingStore.getState().hydrationDone,
    () => false
  );
}

function useIsAuthenticated() {
  return authStore((state) => state.isAuthenticated);
}

function useHasSeenOnboarding() {
  return onboardingStore((state) => state.hasSeenOnboarding);
}

export default function Index() {
  const authHydrationDone = useAuthHydrationDone();
  const onboardingHydrationDone = useOnboardingHydrationDone();
  const isAuthenticated = useIsAuthenticated();
  const hasSeenOnboarding = useHasSeenOnboarding();

  if (!authHydrationDone || !onboardingHydrationDone) {
    return <View style={{ flex: 1 }} />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
