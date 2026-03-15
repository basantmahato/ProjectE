import type { Metadata } from "next";
import { PageFooterWithPricing } from "@/components/landing";

export const metadata: Metadata = {
  title: "Interview Prep | EduSaaS",
  description: "Technical, HR, and aptitude interview preparation.",
};

export default function InterviewLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooterWithPricing />
    </>
  );
}
