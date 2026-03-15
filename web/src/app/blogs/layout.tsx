import type { Metadata } from "next";
import { PageFooter } from "@/components/landing";

export const metadata: Metadata = {
  title: "Blog | EduSaaS",
  description: "Articles and tips for your learning journey.",
};

export default function BlogsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooter />
    </>
  );
}
