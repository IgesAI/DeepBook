import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { CreateForm } from "@/components/CreateForm";

export const metadata: Metadata = { title: "Create Audiobook" };

export default function CreatePage() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 pt-20 px-6 pb-16 flex flex-col items-center">
        <div className="w-full max-w-2xl mt-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Create an Audiobook
            </h1>
            <p className="text-white/40 text-sm">
              Enter any topic. AI will research, write, and narrate your book.
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.025] border border-white/[0.07] p-6 md:p-8">
            <CreateForm />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/25">
            <span>Research takes 5–15 minutes</span>
            <span>·</span>
            <span>Audio generation: ~2 min per chapter</span>
            <span>·</span>
            <span>Works best with specific topics</span>
          </div>
        </div>
      </main>
    </div>
  );
}
