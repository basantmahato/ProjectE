import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

const CONTENT_MAX_WIDTH = 500;

type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    period: 'month',
    description: 'Perfect for getting started',
    features: [
      'Access to mock tests',
      'Sample papers',
      'Basic analytics',
      'Email support',
    ],
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    period: 'month',
    description: 'Full access for serious learners',
    features: [
      'Everything in Basic',
      'Unlimited practice tests',
      'Interview prep content',
      'Priority support',
      'Detailed performance insights',
    ],
    highlighted: true,
  },
];

export default function Billing() {
  const router = useRouter();
  const theme = themeStore((state) => state.theme);
  const dark = theme === 'dark';
  const colors = dark ? darkColors : lightColors;

  const { width } = Dimensions.get('window');
  const horizontalPadding = Math.min(Math.max(width * 0.05, 16), 24);

  const handleSelectPlan = (planId: string) => {
    // Placeholder: could navigate to checkout or show payment sheet
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Billing</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Choose a plan that fits your goals
        </Text>

        {PLANS.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: colors.card,
                borderColor: plan.highlighted ? colors.primary : colors.border,
                borderWidth: plan.highlighted ? 2 : 1,
              },
            ]}
          >
            {plan.highlighted && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.primary }]}>₹{plan.price}</Text>
                <Text style={[styles.period, { color: colors.subText }]}>/{plan.period}</Text>
              </View>
            </View>
            <Text style={[styles.planDescription, { color: colors.subText }]}>
              {plan.description}
            </Text>
            <View style={[styles.featuresList, { borderTopColor: colors.border }]}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <MaterialIcons
                    name="check-circle"
                    size={18}
                    color={colors.success}
                    style={styles.featureIcon}
                  />
                  <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => handleSelectPlan(plan.id)}
              style={({ pressed }) => [
                styles.planBtn,
                {
                  backgroundColor: plan.highlighted ? colors.primary : colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.planBtnText,
                  { color: plan.highlighted ? '#fff' : colors.text },
                ]}
              >
                {plan.highlighted ? 'Get Premium' : 'Get Basic'}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: { fontSize: 22, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 28, fontWeight: '700' },
  period: { fontSize: 16, marginLeft: 2 },
  planDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  featuresList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
    marginBottom: 20,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { marginRight: 10 },
  featureText: { fontSize: 15, flex: 1 },
  planBtn: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planBtnText: { fontSize: 16, fontWeight: '600' },
});
