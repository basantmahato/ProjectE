import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | EduSaaS",
  description: "Create your EduSaaS account and get started for free.",
};

export default function RegisterLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
