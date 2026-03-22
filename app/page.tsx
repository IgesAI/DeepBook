import Link from "next/link";
import { BookOpen, Search, FileText, Headphones, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 h-16">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-semibold tracking-tight text-white">DeepBook</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Library
          </Link>
          <Link
            href="/create"
            className="text-sm bg-amber-500 text-black font-semibold px-4 py-2 rounded-xl hover:bg-amber-400 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pb-24 pt-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Powered by OpenAI Deep Research + ElevenLabs
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.05] mb-6">
          Deep research.
          <br />
          <span className="text-amber-400">Beautifully narrated.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/45 max-w-xl leading-relaxed mb-10">
          Enter any topic. Our AI researches hundreds of sources, writes a
          compelling script, and narrates it as a professional audiobook —
          in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/create"
            className="group flex items-center gap-2 bg-amber-500 text-black font-semibold px-6 py-3.5 rounded-2xl hover:bg-amber-400 transition-all text-base shadow-xl shadow-amber-500/20"
          >
            Create Your Audiobook
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 font-medium px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-all text-base"
          >
            Browse Library
          </Link>
        </div>
      </main>

      {/* How it works */}
      <section className="relative z-10 px-6 md:px-10 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-white mb-2">
              How it works
            </h2>
            <p className="text-white/40 text-sm">
              Three steps. One audiobook.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Search,
                step: "01",
                title: "Deep Research",
                desc: "Our AI scours hundreds of sources, papers, and articles to build a comprehensive understanding of your topic.",
              },
              {
                icon: FileText,
                step: "02",
                title: "Script Writing",
                desc: "GPT-4.1 transforms raw research into an engaging, chapter-structured audiobook narrative — no citations, pure storytelling.",
              },
              {
                icon: Headphones,
                step: "03",
                title: "Professional Narration",
                desc: "ElevenLabs voices bring the script to life with natural, expressive speech. Choose from dozens of narrator voices.",
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="group rounded-2xl bg-white/[0.025] border border-white/[0.06] p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-white/20 tracking-widest">
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
