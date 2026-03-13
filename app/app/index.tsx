import { Redirect } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { View } from 'react-native';

import { authStore } from '@/store/authStore';

function useHydrationDone() {
  return useSyncExternalStore(
    (cb) => authStore.subscribe(cb),
    () => authStore.getState().hydrationDone,
    () => false
  );
}

function useIsAuthenticated() {
  return authStore((state) => state.isAuthenticated);
}

export default function Index() {
  const hydrationDone = useHydrationDone();
  const isAuthenticated = useIsAuthenticated();

  if (!hydrationDone) {
    return <View style={{ flex: 1 }} />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
