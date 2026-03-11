import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ThemeColors } from './useColors';

type BalanceCardProps = {
  colors: ThemeColors;
  balance?: string;
  profitPercent?: string;
};

export function BalanceCard({
  colors,
  balance = '$10,000.00',
  profitPercent = '+20%',
}: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.subText }]}>Total Balance</Text>
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons
            name={visible ? 'visibility' : 'visibility-off'}
            size={22}
            color={colors.subText}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.amount, { color: colors.text }]}>
        {visible ? balance : '••••••••'}
      </Text>
      <View style={styles.profitRow}>
        <View style={[styles.badge, { backgroundColor: colors.success + '25' }]}>
          <Text style={[styles.badgeText, { color: colors.success }]}>{profitPercent}</Text>
        </View>
        <Text style={[styles.profitLabel, { color: colors.subText }]}>Profit & Loss</Text>
      </View>
      <View style={styles.chartPlaceholder}>
        <View style={styles.chartLine}>
          {[40, 55, 45, 70, 50, 65, 80].map((h, i) => (
            <View
              key={i}
              style={[
                styles.chartBar,
                {
                  height: h,
                  backgroundColor: colors.primary + '40',
                  marginRight: i === 6 ? 0 : 6,
                },
              ]}
            />
          ))}
        </View>
        <View style={[styles.chartLine, styles.chartLineSecond]}>
          {[35, 50, 60, 45, 70, 55, 45].map((h, i) => (
            <View
              key={i}
              style={[
                styles.chartBar,
                {
                  height: h,
                  backgroundColor: colors.danger + '40',
                  marginRight: i === 6 ? 0 : 6,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profitLabel: {
    fontSize: 13,
  },
  chartPlaceholder: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  chartLineSecond: {
    marginLeft: 8,
  },
  chartBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 4,
  },
});
