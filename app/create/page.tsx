import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { CreateForm } from "@/components/CreateForm";

export const metadata: Metadata = { title: "Create Audiobook" };

export default function CreatePage() {
  return (
    <div className="min-h-screen">
      <Nav active="create" />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 pt-20 lg:pl-64 px-6 pb-24 lg:pb-10 flex flex-col items-center">
        <div className="w-full max-w-2xl mt-8">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-[1.25rem] bg-primary/10 ring-1 ring-primary/20 mb-5">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_stories
              </span>
            </div>
            <h1 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">
              Create an Audiobook
            </h1>
            <p className="font-label text-on-surface-variant/50 text-sm">
              Enter any topic. We research, write, and narrate it for you.
            </p>
          </div>

          {/* Form card */}
          <div className="glass-card rounded-[1.5rem] p-6 md:p-8">
            <CreateForm />
          </div>

          {/* Info hints */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-label text-on-surface-variant/25">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
              Research takes 5–15 minutes
            </span>
            <span className="text-on-surface-variant/15">·</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>mic</span>
              ~2 min audio per chapter
            </span>
            <span className="text-on-surface-variant/15">·</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>download</span>
              Download as MP3
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
