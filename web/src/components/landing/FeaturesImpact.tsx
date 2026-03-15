const IMPACT_ITEMS = [
  {
    icon: "workspace_premium",
    title: "Curated question bank",
    description:
      "Thousands of questions organized by subject and topic. Practice with real exam-style questions and detailed solutions.",
  },
  {
    icon: "quiz",
    title: "Mock tests & sample papers",
    description:
      "Timed mock tests and sample papers that mirror real exams. Build stamina and improve time management.",
  },
  {
    icon: "menu_book",
    title: "Notes & interview prep",
    description:
      "Structured notes and interview prep materials. Learn concepts and practice for placements and interviews.",
  },
];

export function FeaturesImpact() {
  return (
    <section
      id="features"
      className="border-y border-slate-200 bg-slate-50 py-16 dark:border-[var(--navy-800)] dark:bg-[var(--navy-800)]/30 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center animate-reveal sm:mb-16">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Our impact
          </h2>
          <h3 className="text-3xl font-black text-[var(--navy-900)] dark:text-white sm:text-4xl md:text-5xl">
            Why students choose us
          </h3>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {IMPACT_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`animate-reveal rounded-3xl border border-slate-100 bg-white p-6 shadow-lg transition-all dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] hover:shadow-2xl sm:p-8 ${
                i === 0
                  ? "animate-reveal-delay-1"
                  : i === 1
                    ? "animate-reveal-delay-2"
                    : "animate-reveal-delay-3"
              }`}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
                  {item.icon}
                </span>
              </div>
              <h4 className="mb-4 text-xl font-bold text-[var(--navy-900)] dark:text-white">
                {item.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
