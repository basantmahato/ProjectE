const SCALE_FEATURES = [
  {
    icon: "library_books",
    title: "Question bank & tests",
    description:
      "Browse by subject and topic. Take scheduled tests, attempt questions with instant feedback, and track your performance over time.",
  },
  {
    icon: "groups",
    title: "Mock tests & sample papers",
    description:
      "Full-length mock tests and sample papers with timers and analytics. Review answers and identify weak areas to improve.",
  },
  {
    icon: "description",
    title: "Notes & interview prep",
    description:
      "Access structured notes and interview prep content. Stay organized with subjects and topics that match your syllabus.",
  },
];

export function FeaturesScale() {
  return (
    <section className="bg-white py-16 dark:bg-[var(--navy-900)] sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Built for exam success
          </h2>
          <h3 className="text-3xl font-black text-[var(--navy-900)] dark:text-white sm:text-4xl md:text-5xl">
            Everything you need to prepare
          </h3>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {SCALE_FEATURES.map((item) => (
            <div
              key={item.title}
              className="group cursor-default rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm transition-all duration-500 hover:bg-[var(--primary)] dark:border-[var(--navy-700)] dark:bg-[var(--navy-800)] animate-reveal"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 transition-colors group-hover:bg-white/20">
                <span className="material-symbols-outlined text-3xl text-[var(--primary)] group-hover:text-white">
                  {item.icon}
                </span>
              </div>
              <h4 className="mb-4 text-2xl font-bold text-[var(--navy-900)] group-hover:text-white dark:text-white">
                {item.title}
              </h4>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400 group-hover:text-white/90">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
