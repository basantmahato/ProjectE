"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blogs", label: "Blog" },
  { href: "/notes", label: "Notes" },
  { href: "/interview", label: "Interview" },
  { href: "/tests", label: "Tests" },
  { href: "/moctest", label: "Mock Test" },
  { href: "/samplepapers", label: "Sample Papers" },
];

function NavbarInner() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, isAuthReady, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--navy-900)] dark:text-white"
          >
            <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
              school
            </span>
            <span className="text-xl font-bold tracking-tight">EduSaaS</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.filter((link) =>
              link.href === "/dashboard" ? isLoggedIn : true
            ).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-[var(--primary)] dark:text-slate-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex min-w-[120px] items-center justify-end gap-2 sm:gap-4">
            {!isAuthReady ? (
              <span
                className="inline-block h-9 w-20 animate-pulse rounded-lg bg-slate-200/60 dark:bg-[var(--navy-800)]"
                aria-hidden
              />
            ) : isLoggedIn ? (
              <>
                <Link
                  href="/notifications"
                  aria-label="Notifications"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-[var(--primary)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
                >
                  <span className="material-symbols-outlined text-2xl">
                    notifications
                  </span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  aria-label="Settings"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/25"
                >
                  <span className="material-symbols-outlined text-2xl">
                    account_circle
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] dark:border-[var(--navy-700)] dark:text-slate-300 dark:hover:border-[var(--primary)] md:inline-flex md:px-4"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-semibold text-slate-700 transition-colors hover:text-[var(--primary)] dark:text-slate-300 sm:block"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-90 sm:px-5"
                >
                  Get Started
                </Link>
              </>
            )}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[var(--navy-800)] md:hidden"
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-slate-200 py-4 dark:border-[var(--navy-800)] md:hidden">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.filter((link) =>
                link.href === "/dashboard" ? isLoggedIn : true
              ).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[var(--primary)] dark:text-slate-300 dark:hover:bg-[var(--navy-800)]"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthReady ? null : isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarInner);
