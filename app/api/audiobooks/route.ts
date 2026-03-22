import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startPipeline } from "@/lib/pipeline";

export async function GET() {
  const audiobooks = await db.audiobook.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      chapters: {
        select: { id: true, number: true, title: true, audioPath: true, duration: true },
        orderBy: { number: "asc" },
      },
    },
  });
  return NextResponse.json(audiobooks);
}

export async function POST(req: NextRequest) {
  const { topic, voiceId, voiceName, answers, sequelOf } = await req.json();

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }
  if (!voiceId) {
    return NextResponse.json({ error: "Voice is required" }, { status: 400 });
  }

  const audiobook = await db.audiobook.create({
    data: {
      topic: topic.trim(),
      voiceId,
      voiceName: voiceName || "",
      answers: answers ? JSON.stringify(answers) : "",
      sequelOf: sequelOf || "",
      status: "queued",
    },
  });

  startPipeline(audiobook.id);

  return NextResponse.json(audiobook, { status: 201 });
}
