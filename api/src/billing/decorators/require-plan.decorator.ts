import { SetMetadata } from '@nestjs/common';
import { PlanId } from '../plan-features';

export const REQUIRE_PLAN_KEY = 'requirePlan';

export const RequirePlan = (minPlan: PlanId) =>
  SetMetadata(REQUIRE_PLAN_KEY, minPlan);
