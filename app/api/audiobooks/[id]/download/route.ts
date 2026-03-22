import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audiobook = await db.audiobook.findUnique({
    where: { id },
    include: { chapters: { orderBy: { number: "asc" } } },
  });

  if (!audiobook || audiobook.status !== "complete") {
    return NextResponse.json({ error: "Not found or not ready" }, { status: 404 });
  }

  // Concatenate all chapter MP3 buffers in order
  const buffers: Buffer[] = [];
  for (const chapter of audiobook.chapters) {
    if (!chapter.audioPath) continue;
    const filePath = path.join(process.cwd(), "public", chapter.audioPath);
    try {
      const buf = await readFile(filePath);
      buffers.push(buf);
    } catch {
      // Skip missing files gracefully
    }
  }

  if (buffers.length === 0) {
    return NextResponse.json({ error: "No audio files found" }, { status: 404 });
  }

  const combined = Buffer.concat(buffers);
  const filename = `${audiobook.title || audiobook.topic}`
    .replace(/[^a-z0-9\s-]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);

  return new NextResponse(combined, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}.mp3"`,
      "Content-Length": String(combined.byteLength),
    },
  });
}
