import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type PersistStorage = {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
};

const webStorage: PersistStorage = {
  getItem: (name: string) =>
    Promise.resolve(
      typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null
    ),
  setItem: (name: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
    return Promise.resolve();
  },
};

export const storageAdapter: PersistStorage =
  Platform.OS === 'web' ? webStorage : AsyncStorage;
