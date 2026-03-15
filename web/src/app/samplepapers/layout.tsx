import type { Metadata } from "next";
import { PageFooterWithPricing } from "@/components/landing";

export const metadata: Metadata = {
  title: "Sample Papers | EduSaaS",
  description: "Sample and model papers for exam practice.",
};

export default function SamplepapersLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooterWithPricing />
    </>
  );
}
