import { useRazorpay } from '@codearcade/expo-razorpay';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import api from '@/lib/axios';
import { authStore } from '@/store/authStore';
import { themeStore } from '@/store/themeStore';
import { darkColors, lightColors } from '@/themes/color';

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
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Try before you commit',
    features: [
      '1 trial mock test',
      'Browse sample papers',
      'Blog & community access',
      'Create an account to start',
    ],
    highlighted: false,
  },
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
  const user = authStore((state) => state.user);
  const setUserAfterPayment = authStore((state) => state.setUserAfterPayment);
  const { openCheckout, RazorpayUI } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const { horizontalPadding, contentMaxWidth } = useResponsiveLayout();

  const currentPlan = user ? PLANS.find((p) => p.id === user.plan) : undefined;

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      Alert.alert('Free plan', "You're on the Free plan. Create an account or sign in to get started.");
      return;
    }
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to upgrade your plan.');
      router.push('/(auth)/login');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/billing/order', { planId });
      const { orderId, amount, currency, keyId } = data;
      openCheckout(
        {
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: 'ProjE',
          description: `${planId === 'basic' ? 'Basic' : 'Premium'} plan`,
          prefill: {
            name: user.name ?? undefined,
            email: user.email,
          },
        },
        {
          onSuccess: async (paymentData) => {
            try {
              const verifyRes = await api.post<{ user: typeof user }>('/billing/verify', {
                planId,
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
              });
              if (verifyRes.data?.user) {
                await setUserAfterPayment(verifyRes.data.user);
                setLoading(false);
                Alert.alert('Success', `You are now on the ${planId === 'basic' ? 'Basic' : 'Premium'} plan.`, [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              } else {
                setLoading(false);
              }
            } catch (err: unknown) {
              setLoading(false);
              const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Verification failed';
              Alert.alert('Verification failed', String(msg));
            }
          },
          onFailure: (error) => {
            setLoading(false);
            Alert.alert('Payment failed', error?.description ?? 'Payment could not be completed.');
          },
          onClose: () => setLoading(false),
        },
      );
    } catch (err: unknown) {
      setLoading(false);
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Could not create order';
      Alert.alert('Error', String(msg));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Billing</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Choose a plan that fits your goals
        </Text>

        {user && currentPlan && (
          <View
            style={[
              styles.currentPlanCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.currentPlanLabel, { color: colors.subText }]}>
              Your current plan
            </Text>
            <View style={styles.currentPlanRow}>
              <Text style={[styles.currentPlanName, { color: colors.text }]}>
                {currentPlan.name}
              </Text>
              {currentPlan.price === 0 ? (
                <Text style={[styles.currentPlanPrice, { color: colors.primary }]}>Free</Text>
              ) : (
                <Text style={[styles.currentPlanPrice, { color: colors.primary }]}>
                  ₹{currentPlan.price}/{currentPlan.period}
                </Text>
              )}
            </View>
          </View>
        )}

        {PLANS.map((plan) => {
          const isCurrentPlan = user && plan.id === user.plan;
          return (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: colors.card,
                borderColor: plan.highlighted && !isCurrentPlan ? colors.primary : colors.border,
                borderWidth: plan.highlighted && !isCurrentPlan ? 2 : 1,
              },
            ]}
          >
            {isCurrentPlan ? (
              <View style={[styles.badge, styles.badgeCurrent, { backgroundColor: colors.border }]}>
                <Text style={[styles.badgeText, styles.badgeTextCurrent, { color: colors.text }]}>Current plan</Text>
              </View>
            ) : plan.highlighted ? (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>Popular</Text>
              </View>
            ) : null}
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
              <View style={styles.priceRow}>
                {plan.price === 0 ? (
                  <Text style={[styles.price, { color: colors.primary }]}>Free</Text>
                ) : (
                  <>
                    <Text style={[styles.price, { color: colors.primary }]}>₹{plan.price}</Text>
                    <Text style={[styles.period, { color: colors.subText }]}>/{plan.period}</Text>
                  </>
                )}
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
              onPress={() => !isCurrentPlan && handleSelectPlan(plan.id)}
              disabled={loading || isCurrentPlan}
              style={({ pressed }) => [
                styles.planBtn,
                {
                  backgroundColor: isCurrentPlan ? colors.border : plan.highlighted ? colors.primary : colors.border,
                  opacity: loading || isCurrentPlan ? 0.6 : pressed ? 0.9 : 1,
                },
              ]}
            >
              {loading && !isCurrentPlan ? (
                <ActivityIndicator color={plan.highlighted ? '#fff' : colors.text} size="small" />
              ) : (
                <Text
                  style={[
                    styles.planBtnText,
                    { color: isCurrentPlan ? colors.subText : plan.highlighted ? '#fff' : colors.text },
                  ]}
                >
                  {isCurrentPlan
                    ? 'Current plan'
                    : plan.id === 'free'
                      ? 'Get Started'
                      : plan.highlighted
                        ? 'Get Premium'
                        : 'Get Basic'}
                </Text>
              )}
            </Pressable>
          </View>
          );
        })}
      </ScrollView>
      {RazorpayUI}
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
    alignSelf: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  currentPlanCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  currentPlanLabel: {
    fontSize: 13,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentPlanPrice: {
    fontSize: 16,
    fontWeight: '600',
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
  badgeCurrent: {},
  badgeTextCurrent: {},
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
