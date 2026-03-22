import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check in-memory job store first (real-time during pipeline)
  const job = getJob(id);
  if (job) {
    return NextResponse.json(job);
  }

  // Fall back to DB (for completed jobs or after server restart)
  const audiobook = await db.audiobook.findUnique({
    where: { id },
    select: { status: true, progress: true },
  });

  if (!audiobook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id,
    status: audiobook.status,
    progress: audiobook.progress || "",
    percent: audiobook.status === "complete" ? 100 : 0,
  });
}
