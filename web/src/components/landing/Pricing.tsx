"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  getCurrentUser,
  hasPaidPlan,
  createBillingOrder,
  verifyBillingPayment,
} from "@/lib/api";

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

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    period: "/mo",
    description: "Perfect for trying out",
    features: [
      "2 tests per day",
      "10 mock tests/month",
      "10 sample papers/month",
      "Blog & community access",
    ],
    highlighted: false,
  },
  {
    id: "basic" as const,
    name: "Basic",
    price: 49,
    period: "/mo",
    description: "For serious exam prep",
    features: [
      "Unlimited tests",
      "Unlimited mock tests",
      "Sample papers",
      "Interview prep",
      "Email support",
    ],
    highlighted: false,
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 99,
    period: "/mo",
    description: "Full access for serious learners",
    features: [
      "Everything in Basic",
      "Unlimited practice",
      "Interview prep",
      "Priority support",
      "Performance insights",
    ],
    highlighted: true,
  },
];

export function Pricing() {
  const queryClient = useQueryClient();
  const { isLoggedIn, isAuthReady } = useAuth();
  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: isAuthReady && isLoggedIn,
  });
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlanId = user?.plan ?? "free";

  // Preload Razorpay when user is logged in so purchase is fast.
  useEffect(() => {
    if (!isLoggedIn || typeof window === "undefined" || window.Razorpay) return;
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) return;
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, [isLoggedIn]);

  const handlePurchasePlan = async (planId: "basic" | "premium") => {
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
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
            : "Could not start payment.";
      setError(msg);
      setLoadingPlan(null);
    }
  };

  return (
    <section
      id="pricing"
      className="bg-white py-16 dark:bg-[var(--navy-900)] sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:mb-16 md:flex-row md:items-end md:justify-between animate-reveal">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
              Pricing
            </h2>
            <h3 className="mt-2 text-3xl font-black text-[var(--navy-900)] dark:text-white sm:text-4xl md:text-5xl">
              Plans that scale with you
            </h3>
          </div>
          <a
            href="#pricing"
            className="mt-8 flex items-center gap-2 font-bold text-[var(--primary)] transition-all hover:gap-4 md:mt-0"
          >
            View all features
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>

        {isLoggedIn && (
          <div className="mb-8 animate-reveal rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)]">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {hasPaidPlan(user?.plan) ? "Your active plan" : "Your current plan"}
            </p>
            <p className="mt-0.5 text-xl font-bold capitalize text-[var(--navy-900)] dark:text-white">
              {currentPlanId === "free" ? "Free" : currentPlanId === "basic" ? "Basic" : "Premium"}
            </p>
            <Link
              href="/billing"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              {hasPaidPlan(user?.plan) ? "Manage plan" : "View billing"}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 animate-reveal rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const isCurrentPlan = currentPlanId === plan.id;
            const isPaidPlan = plan.id === "basic" || plan.id === "premium";
            const canPurchaseHere = isLoggedIn && isPaidPlan && !isCurrentPlan;

            const ctaLabel =
              isCurrentPlan
                ? "Current plan"
                : plan.id === "free"
                  ? "Get Started"
                  : "Upgrade";

            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-3xl border p-6 shadow-lg transition-all hover:-translate-y-2 sm:p-8 ${
                  plan.highlighted && !isCurrentPlan
                    ? "relative z-10 scale-105 border-4 border-[var(--primary)] bg-white shadow-2xl dark:bg-[var(--navy-900)] hover:-translate-y-4"
                    : "border-slate-200 bg-white dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)]"
                } ${i === 0 ? "animate-reveal" : i === 1 ? "animate-reveal animate-reveal-delay-1" : "animate-reveal animate-reveal-delay-2"}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-600 px-6 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg dark:bg-slate-500">
                    Current plan
                  </div>
                )}
                {plan.highlighted && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-6 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="mb-2 text-xl font-bold text-[var(--navy-900)] dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[var(--navy-900)] dark:text-white">
                      {plan.price === 0 ? "Free" : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="font-medium text-slate-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>

                <ul className="mb-10 flex-grow space-y-4">
                  {(plan.features ?? []).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-400"
                    >
                      <span className="material-symbols-outlined text-lg text-green-500">
                        check_circle
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {canPurchaseHere ? (
                  <button
                    type="button"
                    onClick={() => handlePurchasePlan(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full rounded-xl py-4 text-center font-bold shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.highlighted
                        ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/30 hover:opacity-90"
                        : "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white dark:hover:bg-[var(--primary)] dark:hover:text-white"
                    }`}
                  >
                    {loadingPlan === plan.id ? "Opening…" : ctaLabel}
                  </button>
                ) : (
                  <Link
                    href={
                      isCurrentPlan
                        ? "/billing"
                        : plan.id === "free"
                          ? "/register"
                          : "/login"
                    }
                    className={`w-full rounded-xl py-4 text-center font-bold shadow-md transition-all active:scale-95 ${
                      isCurrentPlan
                        ? "cursor-default border-2 border-slate-300 bg-slate-100 text-slate-600 dark:border-[var(--navy-600)] dark:bg-[var(--navy-800)] dark:text-slate-400"
                        : plan.highlighted
                          ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/30 hover:opacity-90"
                          : "border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white dark:hover:bg-[var(--primary)] dark:hover:text-white"
                    }`}
                  >
                    {ctaLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
