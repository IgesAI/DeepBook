import Link from "next/link";
import { BookOpen } from "lucide-react";

interface NavProps {
  title?: string;
}

export function Nav({ title }: NavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
      <Link
        href="/"
        className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <span className="font-semibold tracking-tight text-sm">DeepBook</span>
      </Link>

      {title && (
        <span className="absolute left-1/2 -translate-x-1/2 text-sm text-white/50 font-medium max-w-xs truncate">
          {title}
        </span>
      )}

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Library
        </Link>
        <Link
          href="/create"
          className="text-sm bg-amber-500 text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors"
        >
          New Book
        </Link>
      </div>
    </nav>
  );
}
