import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalNavbar } from "@/components/layout/ConditionalNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "EduSaaS - Exam Prep & Learning Platform",
  description:
    "Question bank, mock tests, sample papers, notes, and interview prep in one platform. Transform your exam preparation with EduSaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${publicSans.variable} antialiased font-[family-name:var(--font-public-sans)]`}
      >
        <Providers>
        <ConditionalNavbar />
        {children}
      </Providers>
      </body>
    </html>
  );
}
