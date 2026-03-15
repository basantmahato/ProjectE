import {
  Hero,
  FeaturesImpact,
  FeaturesScale,
  Pricing,
  HowItWorks,
  Testimonials,
  FAQ,
  CTAWithPlanCheck,
  Footer,
} from "@/components/landing";

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
