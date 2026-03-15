import type { Metadata } from "next";
import { PageFooter } from "@/components/landing";

export const metadata: Metadata = {
  title: "Notes | EduSaaS",
  description: "Structured notes by subject and topic.",
};

export default function NotesLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PageFooter />
    </>
  );
}
