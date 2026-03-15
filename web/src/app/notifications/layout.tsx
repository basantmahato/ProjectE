import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | EduSaaS",
  description: "Your notifications.",
};

export default function NotificationsLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
