export type PlanId = 'free' | 'basic' | 'premium';

const PLAN_ORDER: PlanId[] = ['free', 'basic', 'premium'];

export function hasPlanAtLeast(
  userPlan: PlanId,
  requiredPlan: PlanId,
): boolean {
  return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(requiredPlan);
}

export const PLAN_FEATURES = {
  free: {
    /** Regular (non-mock) tests: max attempts per calendar day */
    maxRegularAttemptsPerDay: 2,
    /** Mock tests: max attempts per calendar month */
    maxMockAttemptsPerMonth: 10,
    /** Sample papers: max distinct papers viewable per calendar month */
    maxSamplePapersPerMonth: 10,
    interviewPrep: false,
    mockTests: true,
  },
  basic: {
    maxRegularAttemptsPerDay: -1,
    maxMockAttemptsPerMonth: -1,
    maxSamplePapersPerMonth: -1,
    interviewPrep: true,
    mockTests: true,
  },
  premium: {
    maxRegularAttemptsPerDay: -1,
    maxMockAttemptsPerMonth: -1,
    maxSamplePapersPerMonth: -1,
    interviewPrep: true,
    mockTests: true,
  },
} as const;
