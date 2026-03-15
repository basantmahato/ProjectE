"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/landing";

const HIDE_NAVBAR_PATHS = ["/login", "/register"];

export function ConditionalNavbar() {
  const pathname = usePathname();
  const hideNavbar = HIDE_NAVBAR_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (hideNavbar) return null;
  return <Navbar />;
}
