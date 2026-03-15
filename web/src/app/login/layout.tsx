import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | EduSaaS",
  description: "Sign in to your EduSaaS account.",
};

export default function LoginLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
