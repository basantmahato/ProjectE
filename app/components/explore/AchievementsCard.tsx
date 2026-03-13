import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import type { AchievementItem, ThemeColors } from './types';

const CARD_PADDING_H_MIN = 16;
const CARD_PADDING_H_MAX = 24;
const CARD_PADDING_V = 20;
const ICON_WRAP_SIZE = 56;

type AchievementsCardProps = {
  colors: ThemeColors;
  achievements: AchievementItem[];
};

export function AchievementsCard({ colors, achievements }: AchievementsCardProps) {
  const { width } = useWindowDimensions();
  const paddingH = Math.min(
    Math.max(width * 0.05, CARD_PADDING_H_MIN),
    CARD_PADDING_H_MAX
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          paddingHorizontal: paddingH,
          paddingVertical: CARD_PADDING_V,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsRow}
      >
        {achievements.map((item) => {
          const unlocked = item.unlocked !== false;
          const iconColor = unlocked ? item.accentColor : colors.subText;
          const wrapBg = unlocked ? item.accentColor + '22' : colors.border + '44';
          return (
            <View key={item.id} style={[styles.achievementItem, !unlocked && styles.achievementItemLocked]}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: wrapBg },
                ]}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={26}
                  color={iconColor}
                />
              </View>
              <Text
                style={[
                  styles.achievementLabel,
                  { color: unlocked ? colors.text : colors.subText },
                ]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 8,
  },
  achievementItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  achievementItemLocked: {
    opacity: 0.65,
  },
  iconWrap: {
    width: ICON_WRAP_SIZE,
    height: ICON_WRAP_SIZE,
    borderRadius: ICON_WRAP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
