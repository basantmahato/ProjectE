import type { Metadata } from "next";
import { PageFooterWithPricing } from "@/components/landing";

export const metadata: Metadata = {
  title: "Mock Tests | EduSaaS",
  description: "Full-length mock tests with timers.",
};

export default function MoctestLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooterWithPricing />
    </>
  );
}
