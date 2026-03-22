import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cancelJob } from "@/lib/jobs";
import { rm } from "fs/promises";
import path from "path";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Signal the pipeline to stop at next checkpoint
  cancelJob(id);

  // Clean up audio files if any were written
  const audioDir = path.join(process.cwd(), "public", "audio", id);
  await rm(audioDir, { recursive: true, force: true });

  // Remove from DB
  await db.audiobook.delete({ where: { id } }).catch(() => {
    // Already deleted or never existed — ignore
  });

  return NextResponse.json({ success: true });
}
