import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-background">

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/[0.04] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-secondary/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* ── Navigation ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 h-20">
        <span className="font-headline font-bold text-xl text-primary tracking-tight">DeepBook</span>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="font-label text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Library
          </Link>
          <Link
            href="/create"
            className="font-label font-bold text-sm bg-primary text-on-primary-fixed px-5 py-2.5 rounded-full hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,185,95,0.25)]"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pb-20 pt-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-0 text-on-surface-variant/60 text-xs font-label mb-10">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          Turn any topic into a professionally narrated audiobook
        </div>

        <h1 className="font-headline font-bold text-5xl md:text-7xl tracking-tight text-on-surface max-w-3xl leading-[1.05] mb-6">
          Any topic.
          <br />
          <span className="text-primary text-glow-amber">Beautifully narrated.</span>
        </h1>

        <p className="text-lg md:text-xl text-on-surface-variant/50 max-w-xl leading-relaxed mb-12 font-body">
          Enter a topic, person, or question. We research it thoroughly, write a
          compelling multi-chapter script, and narrate it with a professional voice.
          All automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/create"
            className="group flex items-center gap-2.5 bg-primary text-on-primary-fixed font-label font-bold px-7 py-3.5 rounded-full hover:scale-[1.02] transition-all text-base shadow-[0_0_40px_rgba(255,185,95,0.3)]"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            Create Your Audiobook
            <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 glass-card border-0 text-on-surface-variant font-label font-medium px-7 py-3.5 rounded-full hover:text-on-surface transition-all text-base"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>library_music</span>
            Browse Library
          </Link>
        </div>
      </main>

      {/* ── How it works ── */}
      <section className="relative z-10 px-6 md:px-10 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">How it works</h2>
            <p className="text-on-surface-variant/40 text-sm font-body">Three stages. One audiobook.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: "travel_explore",
                step: "01",
                title: "Deep Research",
                desc: "We scan hundreds of sources, articles, and expert perspectives to build a comprehensive, accurate understanding of your topic.",
              },
              {
                icon: "edit_document",
                step: "02",
                title: "Script Writing",
                desc: "Your research is transformed into an engaging, chapter-structured narrative. Written with clarity, flow, and depth.",
              },
              {
                icon: "record_voice_over",
                step: "03",
                title: "Professional Narration",
                desc: "Your script is brought to life with a natural, expressive narrator voice. Choose from dozens of voices before you begin.",
              },
            ].map(({ icon, step, title, desc }) => (
              <div
                key={step}
                className="glass-card rounded-[1.5rem] p-6 hover:shadow-[0_0_30px_rgba(255,185,95,0.06)] hover:ring-1 hover:ring-primary/15 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{icon}</span>
                  </div>
                  <span className="text-xs font-label text-on-surface-variant/25 tracking-[0.2em]">{step}</span>
                </div>
                <h3 className="font-headline font-semibold text-on-surface mb-2">{title}</h3>
                <p className="text-sm text-on-surface-variant/50 font-body leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center">
        <p className="text-xs font-label text-on-surface-variant/25">
          © 2025 DeepBook · Turn knowledge into audio
        </p>
      </footer>
    </div>
  );
}
