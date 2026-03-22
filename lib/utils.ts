import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function splitIntoChunks(text: string, maxChars = 4500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["']?\s*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length <= maxChars) {
      current += sentence;
    } else {
      if (current.trim()) chunks.push(current.trim());
      current = sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length ? chunks : [text.substring(0, maxChars)];
}

export function gradientForId(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradients = [
    "from-amber-900/60 to-orange-900/40",
    "from-indigo-900/60 to-purple-900/40",
    "from-emerald-900/60 to-teal-900/40",
    "from-rose-900/60 to-pink-900/40",
    "from-sky-900/60 to-blue-900/40",
    "from-violet-900/60 to-indigo-900/40",
  ];
  return gradients[hash % gradients.length];
}
