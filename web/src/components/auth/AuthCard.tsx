import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[max(884px,100dvh)] flex-col items-center justify-center bg-[var(--background-light)] px-4 py-5 dark:bg-[var(--background-dark)] sm:px-6 sm:py-6">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 text-[var(--navy-900)] dark:text-white sm:mb-5"
      >
        <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
          school
        </span>
        <span className="text-xl font-bold tracking-tight">EduSaaS</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] sm:p-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {children}

        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-[var(--navy-800)]">
          {footer}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400 sm:mt-5">
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
