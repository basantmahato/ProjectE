import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ThemeColors } from './useColors';
import { SearchBar } from './SearchBar';

type DashboardHeaderProps = {
  colors: ThemeColors;
  userName?: string;
};

export function DashboardHeader({ colors, userName = 'Jakes' }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.title}>Hi, {userName}!</Text>
          <Text style={styles.subtitle}>Welcome Back!</Text>
        </View>
        <TouchableOpacity
          style={[styles.bellWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          activeOpacity={0.7}
          onPress={() => router.push('/notifications')}
        >
          <MaterialIcons name="notifications" size={22} color="#fff" />
          <View style={[styles.badge, { backgroundColor: colors.danger }]} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchWrap}>
        <SearchBar colors={{ ...colors, card: 'rgba(255,255,255,0.95)' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingBlock: {},
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchWrap: {
    marginHorizontal: -4,
  },
});
