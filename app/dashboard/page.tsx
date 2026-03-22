import Link from "next/link";
import { db } from "@/lib/db";
import { Nav } from "@/components/Nav";
import { AudiobookCard } from "@/components/AudiobookCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const audiobooks = await db.audiobook.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });

  return (
    <div className="min-h-screen">
      <Nav active="library" />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 pt-20 lg:pl-64 px-6 md:px-8 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between py-8">
            <div>
              <h1 className="font-headline font-bold text-2xl text-on-surface">My Library</h1>
              <p className="text-sm font-label text-on-surface-variant/50 mt-0.5">
                {audiobooks.length} audiobook{audiobooks.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href="/create"
              className="hidden sm:flex items-center gap-2 bg-primary text-on-primary-fixed font-label font-bold px-5 py-2.5 rounded-full hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,185,95,0.2)] text-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
              New Audiobook
            </Link>
          </div>

          {audiobooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-[1.5rem] glass-card">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-4xl">
                  library_music
                </span>
              </div>
              <div>
                <h2 className="font-headline font-semibold text-lg text-on-surface/60 mb-1">
                  Your library is empty
                </h2>
                <p className="text-sm font-label text-on-surface-variant/35">
                  Create your first audiobook to get started.
                </p>
              </div>
              <Link
                href="/create"
                className="mt-2 flex items-center gap-2 bg-primary text-on-primary-fixed font-label font-bold px-6 py-3 rounded-full hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,185,95,0.2)] text-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                Create Audiobook
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {audiobooks.map((book) => (
                <AudiobookCard
                  key={book.id}
                  id={book.id}
                  topic={book.topic}
                  title={book.title}
                  voiceName={book.voiceName}
                  status={book.status}
                  chapterCount={book._count.chapters}
                  createdAt={book.createdAt}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
