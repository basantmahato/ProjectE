"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, hasPaidPlan } from "@/lib/api";
import { CTA } from "./CTA";

/**
 * Renders CTA only when the user does not have a paid plan (basic or premium).
 * Uses the same billing logic as settings and billing page: hide CTA if user has any paid plan.
 */
export function CTAWithPlanCheck() {
  const { isLoggedIn, isAuthReady } = useAuth();
  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: isAuthReady && isLoggedIn,
  });

  if (!isAuthReady) {
    return <CTA />;
  }
  if (isLoggedIn && hasPaidPlan(user?.plan)) {
    return null;
  }
  return <CTA />;
}
