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
  const isTwoColumn = items.length <= 2;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Explore
      </Text>
      <View style={[styles.grid, isTwoColumn && styles.gridTwo]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              isTwoColumn && styles.cardLarge,
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
                  size={isTwoColumn ? 26 : 22}
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridTwo: {
    gap: 14,
  },
  card: {
    minWidth: 140,
    flex: 1,
    maxWidth: '48%',
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLarge: {
    flex: 1,
    minWidth: 0,
    maxWidth: undefined,
    minHeight: 100,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
