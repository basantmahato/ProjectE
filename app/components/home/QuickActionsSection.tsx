import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ThemeColors } from './useColors';

export type QuickActionItem = {
  label: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  href?: string;
};

type QuickActionsSectionProps = {
  colors: ThemeColors;
  items?: QuickActionItem[];
};

const DEFAULT_ITEMS: QuickActionItem[] = [
  { label: 'Explore', icon: 'explore', href: '/(tabs)/explore' },
  { label: 'Settings', icon: 'settings', href: '/(tabs)/settings' },
];

export function QuickActionsSection({ colors, items = DEFAULT_ITEMS }: QuickActionsSectionProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Quick actions
      </Text>
      <View style={styles.grid}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => item.href && router.push(item.href as any)}
          >
            {item.icon && (
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + '20' }]}>
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={colors.primary}
                />
              </View>
            )}
            <Text style={[styles.cardLabel, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    minWidth: 140,
    flex: 1,
    maxWidth: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
