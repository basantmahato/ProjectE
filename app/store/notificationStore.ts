import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageAdapter } from './storage';

interface NotificationStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
}

export const notificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
      toggle: () => set((state) => ({ enabled: !state.enabled })),
    }),
    {
      name: 'app-notification-settings',
      storage: createJSONStorage(() => storageAdapter),
    }
  )
);
