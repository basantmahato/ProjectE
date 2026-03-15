"use client";

import { CTAWithPlanCheck } from "./CTAWithPlanCheck";
import { Footer } from "./Footer";
import { Pricing } from "./Pricing";

/**
 * CTA + Footer block shown on every navbar page (dashboard, blogs, notes, etc.).
 * CTA is hidden when the user has a paid plan (basic or premium).
 */
export function PageFooter() {
  return (
    <>
      <CTAWithPlanCheck />
      <Footer />
    </>
  );
}

/**
 * Pricing + CTA + Footer for pages that require Basic or Premium (Interview, Tests, Mock Test, Sample Papers).
 * CTA is hidden when the user has a paid plan.
 */
export function PageFooterWithPricing() {
  return (
    <>
      <Pricing />
      <CTAWithPlanCheck />
      <Footer />
    </>
  );
}
