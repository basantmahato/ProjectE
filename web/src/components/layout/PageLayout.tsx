type PageLayoutProps = {
  title: string;
  description?: string;
  icon: string;
  children: React.ReactNode;
};

export function PageLayout({
  title,
  description,
  icon,
  children,
}: PageLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--background-light)] dark:bg-[var(--background-dark)]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-[var(--primary)] sm:text-5xl">
              {icon}
            </span>
            <h1 className="text-2xl font-bold text-[var(--navy-900)] dark:text-white sm:text-3xl md:text-4xl">
              {title}
            </h1>
          </div>
          {description && (
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-lg">
              {description}
            </p>
          )}
        </header>
        {children}
      </main>
    </div>
  );
}
