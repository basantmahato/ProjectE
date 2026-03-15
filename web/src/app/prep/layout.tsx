import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prep | EduSaaS",
  description: "Structured preparation resources and study plans.",
};

export default function PrepLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
