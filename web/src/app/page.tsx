import dynamic from "next/dynamic";
import { Hero } from "@/components/landing";

const FeaturesImpact = dynamic(() =>
  import("@/components/landing/FeaturesImpact").then((m) => ({ default: m.FeaturesImpact })),
);
const FeaturesScale = dynamic(() =>
  import("@/components/landing/FeaturesScale").then((m) => ({ default: m.FeaturesScale })),
);
const Pricing = dynamic(() =>
  import("@/components/landing/Pricing").then((m) => ({ default: m.Pricing })),
);
const HowItWorks = dynamic(() =>
  import("@/components/landing/HowItWorks").then((m) => ({ default: m.HowItWorks })),
);
const Testimonials = dynamic(() =>
  import("@/components/landing/Testimonials").then((m) => ({ default: m.Testimonials })),
);
const FAQ = dynamic(() =>
  import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })),
);
const CTAWithPlanCheck = dynamic(() =>
  import("@/components/landing/CTAWithPlanCheck").then((m) => ({ default: m.CTAWithPlanCheck })),
);
const Footer = dynamic(() =>
  import("@/components/landing/Footer").then((m) => ({ default: m.Footer })),
);

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background-light)] text-slate-900 dark:bg-[var(--background-dark)] dark:text-slate-100">
      <main>
        <Hero />
        <FeaturesImpact />
        <FeaturesScale />
        <Pricing />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTAWithPlanCheck />
        <Footer />
      </main>
    </div>
  );
}
