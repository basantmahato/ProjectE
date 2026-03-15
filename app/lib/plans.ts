export type PlanId = 'free' | 'basic' | 'premium';

const PLAN_ORDER: PlanId[] = ['free', 'basic', 'premium'];

export function hasPlanAtLeast(
  userPlan: PlanId | undefined,
  requiredPlan: PlanId
): boolean {
  if (!userPlan) return requiredPlan === 'free';
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

export const PLAN_FEATURES = {
  free: { interviewPrep: false, mockTests: true },
  basic: { interviewPrep: true, mockTests: true },
  premium: { interviewPrep: true, mockTests: true },
} as const;

export function canAccessFeature(
  userPlan: PlanId | undefined,
  feature: keyof (typeof PLAN_FEATURES)['free']
): boolean {
  const plan = userPlan ?? 'free';
  return PLAN_FEATURES[plan][feature];
}
