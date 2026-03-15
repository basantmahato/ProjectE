import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--background-light)] px-4 py-8 dark:bg-[var(--background-dark)] sm:px-6">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-[var(--navy-900)] dark:text-white"
      >
        <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
          school
        </span>
        <span className="text-xl font-bold tracking-tight">EduSaaS</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {children}

        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-[var(--navy-800)]">
          {footer}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/"
          className="font-medium text-[var(--primary)] hover:underline"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}
