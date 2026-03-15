import type { Metadata } from "next";
import { PageFooter } from "@/components/landing";

export const metadata: Metadata = {
  title: "Dashboard | EduSaaS",
  description: "Your EduSaaS dashboard.",
};

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooter />
    </>
  );
}
