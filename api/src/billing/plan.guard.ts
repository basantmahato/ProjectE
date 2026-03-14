import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq } from 'drizzle-orm';
import { db } from '../database/db';
import { users } from '../database/schema/user.schema';
import { REQUIRE_PLAN_KEY } from './decorators/require-plan.decorator';
import { hasPlanAtLeast, PlanId } from './plan-features';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<PlanId>(
      REQUIRE_PLAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPlan) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) {
      if (requiredPlan === 'free') {
        request.user = request.user ?? {};
        request.user.plan = 'free';
        return true;
      }
      throw new ForbiddenException('Authentication required');
    }

    const [user] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const plan = user.plan as PlanId;
    if (!hasPlanAtLeast(plan, requiredPlan)) {
      throw new ForbiddenException({
        message: 'Upgrade your plan to access this feature',
        code: 'PLAN_UPGRADE_REQUIRED',
      });
    }

    request.user.plan = plan;
    return true;
  }
}
