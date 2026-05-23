export default function WhoWeAre() {
  return (
    <section
      id="who-we-are"
      className="border-y border-slate-200 bg-slate-50/80 py-16 "
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center ">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Who We Are</h2>
          <p className="mt-4 text-sm leading-relaxed text-black  md:text-base">
            Lurnexa Publications is a techno-management knowledge platform dedicated to bridging
            technology, research, and management through high-quality academic publishing. We
            curate research-driven content that inspires critical thinking, analytical learning, and
            real-world application.
          </p>
          
          <p className="mt-3 text-sm leading-relaxed text-black  md:text-base">
            Through collaborations with universities, industries, and research experts, powered by
            digital transformation and AI-enabled workflows, we make knowledge accessible to
            scholars and professionals across the globe.
          </p>
        </div>

        <div className="md:w-1/2">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl dark:border-slate-700">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-linear-to-br from-blue-500 via-sky-400 to-cyan-300 opacity-40 blur-2xl" />
            <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-linear-to-tr from-amber-400 via-amber-300 to-yellow-200 opacity-40 blur-2xl" />
            <div className="relative flex flex-col gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
                Tech • Research • Management
              </p>
              <p className="text-lg font-semibold text-slate-50">
                &quot;Where curiosity meets structured research, and ideas evolve into impact.&quot;
              </p>
              <p className="text-xs text-slate-300">
                A publishing home for innovators, educators, and emerging talent shaping the future
                of techno-management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
