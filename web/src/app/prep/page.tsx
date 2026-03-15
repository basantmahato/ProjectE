import { PageLayout } from "@/components/layout/PageLayout";

const PREP_AREAS = [
  { title: "Syllabus overview", desc: "Subject-wise breakdown and weightage.", icon: "list_alt" },
  { title: "Study plans", desc: "Weekly and monthly plans to stay on track.", icon: "event_note" },
  { title: "Revision checklist", desc: "Topic-wise checklist before exams.", icon: "checklist" },
  { title: "Previous papers", desc: "Pattern and important questions.", icon: "description" },
];

export default function PrepPage() {
  return (
    <PageLayout
      title="Prep"
      description="Structured preparation resources: syllabus, study plans, and revision checklists."
      icon="school"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PREP_AREAS.map((area) => (
          <div
            key={area.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md dark:border-[var(--navy-800)] dark:bg-[var(--navy-900)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <span className="material-symbols-outlined text-2xl text-[var(--primary)]">
                {area.icon}
              </span>
            </div>
            <h2 className="font-bold text-[var(--navy-900)] dark:text-white">
              {area.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {area.desc}
            </p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
