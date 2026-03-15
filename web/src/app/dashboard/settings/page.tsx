"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { getCurrentUser, hasPaidPlan, updateProfile, changePassword } from "@/lib/api";
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormValues,
  type ChangePasswordFormValues,
} from "@/lib/schemas/auth";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500";
const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";
const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8";
const btnPrimary =
  "rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: allowed === true,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user
      ? { name: user.name ?? "", email: user.email }
      : undefined,
    defaultValues: { name: "", email: "" },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfile({
        ...(values.name !== undefined && values.name !== "" && { name: values.name }),
        email: values.email,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      profileForm.reset(profileForm.getValues());
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      passwordForm.reset();
    },
  });

  if (allowed !== true) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
        <div className="text-slate-500 dark:text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[var(--primary)] sm:text-5xl">
              settings
            </span>
            <h1 className="text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl md:text-4xl">
              Settings
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-lg">
            Manage your account and preferences.
          </p>
        </header>

        <div className="space-y-8">
          {/* Plan */}
          <section className={cardClass}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--navy-900)] dark:text-white">
              <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                payments
              </span>
              Plan
            </h2>
            {userLoading ? (
              <div className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-[var(--navy-800)]" />
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {hasPaidPlan(user?.plan)
                      ? "Active plan"
                      : "Current plan"}
                  </p>
                  <p className="mt-1 text-xl font-bold capitalize text-[var(--navy-900)] dark:text-white">
                    {user?.plan ?? "Free"}
                  </p>
                </div>
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] bg-transparent px-4 py-2.5 font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
                >
                  {hasPaidPlan(user?.plan)
                    ? "Manage plan"
                    : "Upgrade plan"}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            )}
          </section>

          {/* Profile */}
          <section className={cardClass}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--navy-900)] dark:text-white">
              <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                person
              </span>
              Profile
            </h2>
            {userLoading ? (
              <div className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-[var(--navy-800)]" />
            ) : (
              <form
                onSubmit={profileForm.handleSubmit((values) =>
                  profileMutation.mutate(values)
                )}
                className="space-y-4"
              >
                {profileMutation.isError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {profileMutation.error instanceof Error
                      ? profileMutation.error.message
                      : "Failed to update profile"}
                  </div>
                )}
                {profileMutation.isSuccess && (
                  <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Profile updated.
                  </div>
                )}
                <div>
                  <label htmlFor="settings-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    {...profileForm.register("name")}
                    placeholder="Your name"
                    className={inputClass}
                    disabled={profileMutation.isPending}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="settings-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    {...profileForm.register("email")}
                    placeholder="you@example.com"
                    className={inputClass}
                    disabled={profileMutation.isPending}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className={btnPrimary}
                >
                  {profileMutation.isPending ? "Saving…" : "Save profile"}
                </button>
              </form>
            )}
          </section>

          {/* Change password */}
          <section className={cardClass}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--navy-900)] dark:text-white">
              <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                lock
              </span>
              Change password
            </h2>
            <form
              onSubmit={passwordForm.handleSubmit((values) =>
                passwordMutation.mutate(values)
              )}
              className="space-y-4"
            >
              {passwordMutation.isError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {passwordMutation.error instanceof Error
                    ? passwordMutation.error.message
                    : "Failed to change password"}
                </div>
              )}
              {passwordMutation.isSuccess && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  Password updated.
                </div>
              )}
              <div>
                <label htmlFor="settings-current-password" className={labelClass}>
                  Current password
                </label>
                <input
                  id="settings-current-password"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  placeholder="••••••••"
                  className={inputClass}
                  autoComplete="current-password"
                  disabled={passwordMutation.isPending}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="settings-new-password" className={labelClass}>
                  New password
                </label>
                <input
                  id="settings-new-password"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  placeholder="At least 6 characters"
                  className={inputClass}
                  autoComplete="new-password"
                  disabled={passwordMutation.isPending}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="settings-confirm-password" className={labelClass}>
                  Confirm new password
                </label>
                <input
                  id="settings-confirm-password"
                  type="password"
                  {...passwordForm.register("confirmNewPassword")}
                  placeholder="••••••••"
                  className={inputClass}
                  autoComplete="new-password"
                  disabled={passwordMutation.isPending}
                />
                {passwordForm.formState.errors.confirmNewPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordForm.formState.errors.confirmNewPassword.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className={btnPrimary}
              >
                {passwordMutation.isPending ? "Updating…" : "Change password"}
              </button>
            </form>
          </section>
        </div>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
