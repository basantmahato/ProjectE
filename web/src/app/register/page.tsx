"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { register as registerApi, loginWithGoogle } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerApi({
        email: values.email.trim(),
        password: values.password,
        name: values.name?.trim() || undefined,
        role: "user",
      }),
    onSuccess: (data) => {
      if (data.access_token) {
        setToken(data.access_token);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      router.refresh();
    },
    onError: (err) => {
      setError("root", {
        type: "manual",
        message:
          err instanceof Error ? err.message : "Registration failed",
      });
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      if (data.access_token) setToken(data.access_token);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err) => {
      setError("root", {
        type: "manual",
        message: err instanceof Error ? err.message : "Google sign-in failed",
      });
    },
  });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  const handleGoogleSuccess = (idToken: string) => {
    googleLoginMutation.mutate(idToken);
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started with EduSaaS for free."
      footer={
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={(err) =>
            setError("root", { type: "manual", message: err.message })
          }
          disabled={googleLoginMutation.isPending}
          theme="outline"
          size="large"
          className="flex justify-center"
        />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-[var(--navy-700)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-slate-500 dark:bg-[var(--navy-900)] dark:text-slate-400">
              or sign up with email
            </span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
        {errors.root?.message && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {errors.root.message}
          </div>
        )}

        <div>
          <label
            htmlFor="register-name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Name <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="register-name"
            type="text"
            {...registerField("name")}
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500"
            disabled={registerMutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            {...registerField("email")}
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500"
            disabled={registerMutation.isPending}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            {...registerField("password")}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500"
            disabled={registerMutation.isPending}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-confirm"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            {...registerField("confirmPassword")}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] dark:text-white dark:placeholder-slate-500"
            disabled={registerMutation.isPending}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-xl bg-[var(--primary)] py-3.5 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {registerMutation.isPending ? "Creating account…" : "Create account"}
        </button>
        </form>
      </div>
    </AuthCard>
  );
}
