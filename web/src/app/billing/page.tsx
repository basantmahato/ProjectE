"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  createBillingOrder,
  verifyBillingPayment,
  type CurrentUser,
} from "@/lib/api";
import { useCurrentUser } from "@/hooks/queries";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    period: "forever",
    description: "Try before you commit",
    features: ["2 tests per day", "10 mock tests/month", "10 sample papers/month", "Blog access"],
  },
  {
    id: "basic" as const,
    name: "Basic",
    price: 49,
    period: "month",
    description: "Perfect for getting started",
    features: ["Unlimited tests", "Unlimited mock tests", "Sample papers", "Interview prep", "Email support"],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 99,
    period: "month",
    description: "Full access for serious learners",
    features: ["Everything in Basic", "Unlimited practice", "Interview prep", "Priority support", "Performance insights"],
    highlighted: true,
  },
];

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function ensureRazorpayLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const t = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(t);
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(t);
          reject(new Error("Payment gateway timed out"));
        }
      }, 100);
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, isAuthReady } = useAuth();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preload Razorpay script when billing page mounts so it's ready when user clicks.
  useEffect(() => {
    if (typeof window === "undefined" || window.Razorpay) return;
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) return;
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const { data: fetchedUser, isPending: fetchingUser } = useCurrentUser(isAuthReady && isLoggedIn);

  useEffect(() => {
    if (fetchedUser) setUser(fetchedUser);
    if (!fetchingUser && !fetchedUser && isAuthReady && isLoggedIn) setUser(null);
  }, [fetchedUser, fetchingUser, isAuthReady, isLoggedIn]);

  useEffect(() => {
    if (isAuthReady && !isLoggedIn) router.replace("/login");
  }, [isAuthReady, isLoggedIn, router]);

  const loadingUser = fetchingUser;

  const handleSelectPlan = async (planId: "basic" | "premium") => {
    if (!user) return;
    setError(null);
    setLoadingPlan(planId);
    try {
      const order = await createBillingOrder(planId);
      await ensureRazorpayLoaded();
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        setError("Payment gateway could not be loaded. Please refresh and try again.");
        setLoadingPlan(null);
        return;
      }
      const rzp = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "ProjE",
        description: `${planId === "basic" ? "Basic" : "Premium"} plan`,
        prefill: { name: user.name ?? undefined, email: user.email },
        handler(response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          verifyBillingPayment({
            planId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
            .then(({ user: updatedUser }) => {
              setUser(updatedUser);
              queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
              router.refresh();
              setLoadingPlan(null);
              window.alert(`You are now on the ${planId === "basic" ? "Basic" : "Premium"} plan.`);
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : "Verification failed.");
              setLoadingPlan(null);
            });
        },
        modal: {
          ondismiss() {
            setLoadingPlan(null);
          },
        },
      });
      rzp.open();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String((err as { message: unknown }).message)
            : "Could not create order. Check that the API is running and you are signed in.";
      setError(msg);
      setLoadingPlan(null);
    }
  };

  if (!isAuthReady || loadingUser) {
    return (
      <PageLayout title="Billing" icon="payments">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const currentPlanId = user?.plan ?? "free";
  const currentPlan = PLANS.find((p) => p.id === currentPlanId);

  return (
    <>
      <Script src={RAZORPAY_SCRIPT} strategy="lazyOnload" />
      <PageLayout
        title="Billing"
        description="Manage your plan and upgrade for more features."
        icon="payments"
      >
        {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {currentPlan && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your current plan
          </h2>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xl font-bold text-[var(--navy-900)] dark:text-white">
              {currentPlan.name}
            </p>
            {currentPlan.price === 0 ? (
              <span className="text-[var(--primary)] font-semibold">Free</span>
            ) : (
              <span className="text-[var(--primary)] font-semibold">
                ₹{currentPlan.price}/{currentPlan.period}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isPaid = plan.id === "basic" || plan.id === "premium";
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 ${
                plan.highlighted && !isCurrent
                  ? "border-[var(--primary)] bg-white dark:bg-[var(--navy-900)]"
                  : "border-slate-200 bg-white dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
              }`}
            >
              {isCurrent && (
                <span className="absolute right-0 top-0 rounded-bl-xl bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-[var(--navy-700)] dark:text-slate-300">
                  Current plan
                </span>
              )}
              {plan.highlighted && !isCurrent && (
                <span className="absolute right-0 top-0 rounded-bl-xl bg-[var(--primary)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-[var(--navy-900)] dark:text-white">
                {plan.name}
              </h3>
              <div className="mt-1 flex items-baseline gap-1">
                {plan.price === 0 ? (
                  <span className="text-[var(--primary)] font-bold">Free</span>
                ) : (
                  <>
                    <span className="text-[var(--primary)] font-bold">₹{plan.price}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/{plan.period}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {(plan.features ?? []).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.id === "free" ? (
                <p className="mt-6 rounded-xl bg-slate-100 py-2.5 text-center text-sm font-medium text-slate-600 dark:bg-[var(--navy-800)] dark:text-slate-400">
                  Free plan
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent || loadingPlan !== null}
                  className="mt-6 w-full rounded-xl bg-[var(--primary)] py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingPlan === plan.id ? "Opening…" : isCurrent ? "Current plan" : `Get ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Settings
        </Link>
      </div>
    </PageLayout>
      <CTA />
      <Footer />
    </>
  );
}
