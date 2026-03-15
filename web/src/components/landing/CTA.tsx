export function CTA() {
  return (
    <section className="relative overflow-hidden bg-white py-16 dark:bg-[var(--navy-900)] sm:py-20 lg:py-24">
      <div className="absolute -translate-y-1/2 translate-x-1/2 right-0 top-0 h-96 w-96 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-reveal rounded-[3rem] bg-[var(--navy-900)] p-8 text-center text-white shadow-2xl dark:bg-[var(--navy-800)] sm:p-12 md:p-20">
          <h3 className="mb-6 text-3xl font-black sm:text-4xl md:text-5xl">
            Take learning anywhere
          </h3>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-300">
            Use the EduSaaS app to practice questions, take mock tests, and
            access notes on the go.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="#"
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[var(--navy-900)] shadow-xl transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-3xl">apple</span>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase leading-none">
                  Download on the
                </div>
                <div className="text-xl font-bold">App Store</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[var(--navy-900)] shadow-xl transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-3xl">
                play_arrow
              </span>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase leading-none">
                  Get it on
                </div>
                <div className="text-xl font-bold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
