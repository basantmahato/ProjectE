const STEPS = [
  {
    step: 1,
    title: "Sign up & choose subjects",
    description:
      "Create your account and select subjects and topics you want to focus on. Your dashboard adapts to your goals.",
  },
  {
    step: 2,
    title: "Practice & take tests",
    description:
      "Use the question bank, attempt mock tests and sample papers. Get instant feedback and track your progress.",
  },
  {
    step: 3,
    title: "Review & improve",
    description:
      "Analyze results, revise with notes and interview prep, and retake tests until you're exam-ready.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 py-16 dark:bg-[var(--navy-800)]/20 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 animate-reveal">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Workflow
          </h2>
          <h3 className="text-3xl font-black text-[var(--navy-900)] dark:text-white sm:text-4xl md:text-5xl">
            How it works
          </h3>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className={`relative text-center animate-reveal ${
                i === 0
                  ? "animate-reveal-delay-1"
                  : i === 1
                    ? "animate-reveal-delay-2"
                    : "animate-reveal-delay-3"
              }`}
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-2xl font-black text-white shadow-lg shadow-[var(--primary)]/30">
                {s.step}
              </div>
              <h4 className="mb-3 text-xl font-bold">{s.title}</h4>
              <p className="text-slate-600 dark:text-slate-400">{s.description}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+4rem)] hidden w-full border-t-2 border-dashed border-slate-200 dark:border-[var(--navy-700)] md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
