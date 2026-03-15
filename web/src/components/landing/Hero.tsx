import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-white pt-16 pb-24 dark:bg-[var(--navy-900)] md:pt-24 md:pb-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8 animate-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                New Features Released
              </span>
            </div>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-[var(--navy-900)] dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Transform exam prep with our{" "}
              <span className="text-[var(--primary)]">EdTech</span> platform
            </h1>

            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Question bank, mock tests, sample papers, interview prep, and notes
              — all in one place. Practice by subject and topic, track progress,
              and ace your exams.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center rounded-xl bg-[var(--primary)] px-8 py-4 text-lg font-bold text-white shadow-xl shadow-[var(--primary)]/25 transition-all hover:-translate-y-0.5 hover:opacity-90"
              >
                Start for Free
              </Link>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-8 py-4 text-lg font-bold transition-all dark:border-[var(--navy-800)] hover:border-[var(--primary)]"
              >
                <span className="material-symbols-outlined transition-colors group-hover:text-[var(--primary)]">
                  play_circle
                </span>
                See how it works
              </a>
            </div>
          </div>

          <div className="relative animate-reveal animate-reveal-delay-2">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--primary)]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-2xl dark:border-[var(--navy-800)]">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt="Students collaborating and studying together"
                width={800}
                height={500}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
