"use client";

const FAQ_ITEMS = [
  {
    question: "Can I use EduSaaS for multiple subjects?",
    answer:
      "Yes. You can follow multiple subjects and topics. On Personal and Organization plans you get full access to the question bank, mock tests, sample papers, and notes across all subjects.",
  },
  {
    question: "Is my data and progress secure?",
    answer:
      "We use industry-standard encryption for data in transit and at rest. Your progress and attempts are stored securely and we are committed to privacy and compliance.",
  },
  {
    question: "Do you offer discounts for institutions?",
    answer:
      "We offer special pricing for schools and institutions. Contact our team for bulk licensing and organization plans with SSO and dedicated support.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="border-t border-slate-200 bg-slate-50 py-16 dark:border-[var(--navy-800)] dark:bg-[var(--navy-800)]/30 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16 animate-reveal">
          <h3 className="mb-4 text-3xl font-black text-[var(--navy-900)] dark:text-white sm:text-4xl">
            Common questions
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Answers to frequently asked questions about EduSaaS.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={item.question}
              className={`faq-accordion animate-reveal rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)] ${
                i === 1 ? "animate-reveal-delay-1" : i === 2 ? "animate-reveal-delay-2" : ""
              }`}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                <span className="text-lg font-bold">{item.question}</span>
                <span className="material-symbols-outlined faq-accordion-icon text-[var(--primary)]">
                  expand_more
                </span>
              </summary>
              <div className="px-6 pb-6 leading-relaxed text-slate-600 dark:text-slate-400">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
