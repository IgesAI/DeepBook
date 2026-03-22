import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "./db";
import { createJob, updateJob, isJobCancelled } from "./jobs";
import { enrichPrompt, runDeepResearch, formatAsAudiobook } from "./openai";
import { generateChapterAudio } from "./elevenlabs";

class CancelledError extends Error {
  constructor() { super("Cancelled by user"); }
}

function checkCancelled(id: string) {
  if (isJobCancelled(id)) throw new CancelledError();
}

// Run tasks with a max concurrency limit
async function parallelLimit(
  tasks: (() => Promise<void>)[],
  limit: number
): Promise<void> {
  const queue = [...tasks];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (task) await task();
    }
  });
  await Promise.all(workers);
}

export function startPipeline(audiobookId: string) {
  // Fire and forget — do not await
  runPipeline(audiobookId).catch(async (err) => {
    if (err instanceof CancelledError) {
      // Pipeline was cancelled by the user — DB cleanup already done via cancel route
      return;
    }
    console.error(`Pipeline failed for ${audiobookId}:`, err);
    updateJob(audiobookId, "error", String(err), 0);
    await db.audiobook.update({
      where: { id: audiobookId },
      data: { status: "error", errorMsg: String(err) },
    });
  });
}

async function runPipeline(audiobookId: string) {
  createJob(audiobookId);
  updateJob(audiobookId, "researching", "Preparing research prompt...", 5);

  const audiobook = await db.audiobook.findUniqueOrThrow({
    where: { id: audiobookId },
  });

  // ── Step 1: Enrich the user's topic into a detailed research prompt
  updateJob(audiobookId, "researching", "Crafting research strategy...", 8);
  const answers = audiobook.answers
    ? (JSON.parse(audiobook.answers) as Record<string, string>)
    : undefined;

  // If this is a sequel, fetch the original book for context
  let priorContext: { title: string; chapterTitles: string[] } | undefined;
  if (audiobook.sequelOf) {
    const parent = await db.audiobook.findUnique({
      where: { id: audiobook.sequelOf },
      include: { chapters: { select: { title: true }, orderBy: { number: "asc" } } },
    });
    if (parent) {
      priorContext = {
        title: parent.title || parent.topic,
        chapterTitles: parent.chapters.map((c) => c.title),
      };
    }
  }

  const enrichedPrompt = await enrichPrompt(audiobook.topic, answers, priorContext);
  checkCancelled(audiobookId);

  // ── Step 2: Deep Research (longest step — can take 5–15 minutes)
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "researching" },
  });

  const researchText = await runDeepResearch(
    enrichedPrompt,
    (msg) => updateJob(audiobookId, "researching", msg, 20)
  );
  checkCancelled(audiobookId);

  // ── Step 3: Format research into audiobook script
  updateJob(audiobookId, "formatting", "Crafting your audiobook script...", 62);
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "formatting", script: researchText },
  });

  const { title, chapters } = await formatAsAudiobook(
    researchText,
    audiobook.topic
  );
  checkCancelled(audiobookId);

  await db.audiobook.update({
    where: { id: audiobookId },
    data: { title },
  });

  // ── Step 4: Generate audio for all chapters in parallel (max 5 concurrent)
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "generating" },
  });

  const audioDir = path.join(process.cwd(), "public", "audio", audiobookId);
  await mkdir(audioDir, { recursive: true });

  updateJob(
    audiobookId,
    "generating",
    `Narrating ${chapters.length} chapters in parallel...`,
    65
  );

  let completed = 0;

  await parallelLimit(
    chapters.map((chapter, i) => async () => {
      const audioBuffer = await generateChapterAudio(
        chapter.content,
        audiobook.voiceId
      );
      const filename = `chapter-${i + 1}.mp3`;
      const audioPath = `/audio/${audiobookId}/${filename}`;

      await writeFile(path.join(audioDir, filename), audioBuffer);

      await db.chapter.create({
        data: {
          audiobookId,
          number: i + 1,
          title: chapter.title,
          content: chapter.content,
          audioPath,
        },
      });

      completed++;
      updateJob(
        audiobookId,
        "generating",
        `Narrating chapters... (${completed}/${chapters.length} done)`,
        65 + Math.round((completed / chapters.length) * 32)
      );
    }),
    5 // ElevenLabs Creator plan allows 5 concurrent requests
  );

  // ── Complete
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "complete" },
  });

  updateJob(audiobookId, "complete", "Your audiobook is ready!", 100);
}
