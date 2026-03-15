import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_COMPLETED_KEY = '@app_onboarding_completed';

interface OnboardingStore {
  hasSeenOnboarding: boolean;
  hydrationDone: boolean;
  hydrate: () => Promise<void>;
  complete: () => Promise<void>;
}

export const onboardingStore = create<OnboardingStore>((set) => ({
  hasSeenOnboarding: false,
  hydrationDone: false,
  hydrate: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      set({
        hasSeenOnboarding: value === 'true',
        hydrationDone: true,
      });
    } catch {
      set({ hasSeenOnboarding: false, hydrationDone: true });
    }
  },
  complete: async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    set({ hasSeenOnboarding: true });
  },
}));
