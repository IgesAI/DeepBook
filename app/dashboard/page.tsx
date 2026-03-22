import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Nav } from "@/components/Nav";
import { AudiobookCard } from "@/components/AudiobookCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const audiobooks = await db.audiobook.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { chapters: true } },
    },
  });

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="pt-20 px-6 md:px-10 pb-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Library</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {audiobooks.length} audiobook{audiobooks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-amber-500 text-black font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Audiobook
          </Link>
        </div>

        {audiobooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
              <BookOpen className="w-7 h-7 text-white/20" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white/60 mb-1">
                No audiobooks yet
              </h2>
              <p className="text-sm text-white/30">
                Create your first audiobook to get started.
              </p>
            </div>
            <Link
              href="/create"
              className="mt-2 flex items-center gap-2 bg-amber-500 text-black font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
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
      </main>
    </div>
  );
}
