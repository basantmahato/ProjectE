const TESTIMONIALS = [
  {
    quote:
      "The question bank and mock tests helped me structure my preparation. I could practice by topic and track my weak areas before the final exam.",
    name: "Sarah Chen",
    role: "Student, Engineering",
    initials: "SC",
  },
  {
    quote:
      "Sample papers and timed tests made a huge difference. The platform feels like the real exam, so I was much more confident on the day.",
    name: "Marcus Rodriguez",
    role: "Competitive exam aspirant",
    initials: "MR",
  },
  {
    quote:
      "Notes and interview prep in one place saved me a lot of time. Everything is organized by subject and topic — exactly what I needed.",
    name: "Julia Lawson",
    role: "Placement preparation",
    initials: "JL",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-white py-16 dark:bg-[var(--navy-900)] sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="mb-12 text-center text-3xl font-black sm:mb-16">
          What our users say
        </h3>

        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="relative rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] sm:p-8"
            >
              <span className="material-symbols-outlined absolute right-8 top-4 text-5xl text-[var(--primary)]/20">
                format_quote
              </span>
              <p className="mb-8 italic text-slate-600 dark:text-slate-400">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/20 font-bold text-[var(--primary)]">
                  {t.initials}
                </div>
                <div>
                  <h5 className="font-bold">{t.name}</h5>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
