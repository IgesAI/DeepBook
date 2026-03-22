import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rm } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audiobook = await db.audiobook.findUnique({
    where: { id },
    include: { chapters: { orderBy: { number: "asc" } } },
  });

  if (!audiobook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(audiobook);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Delete audio files from disk
  const audioDir = path.join(process.cwd(), "public", "audio", id);
  await rm(audioDir, { recursive: true, force: true });

  // Delete from DB (chapters cascade)
  await db.audiobook.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
