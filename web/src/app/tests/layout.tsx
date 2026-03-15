import type { Metadata } from "next";
import { PageFooterWithPricing } from "@/components/landing";

export const metadata: Metadata = {
  title: "Tests | EduSaaS",
  description: "Practice tests and assessments.",
};

export default function TestsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooterWithPricing />
    </>
  );
}
