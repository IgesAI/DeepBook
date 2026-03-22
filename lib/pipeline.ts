import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "./db";
import { createJob, updateJob } from "./jobs";
import { enrichPrompt, runDeepResearch, formatAsAudiobook } from "./openai";
import { generateChapterAudio } from "./elevenlabs";

export function startPipeline(audiobookId: string) {
  // Fire and forget — do not await
  runPipeline(audiobookId).catch(async (err) => {
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
  const enrichedPrompt = await enrichPrompt(audiobook.topic, answers);

  // ── Step 2: Deep Research (longest step — can take 5–15 minutes)
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "researching" },
  });

  const researchText = await runDeepResearch(
    enrichedPrompt,
    (msg) => updateJob(audiobookId, "researching", msg, 20)
  );

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

  await db.audiobook.update({
    where: { id: audiobookId },
    data: { title },
  });

  // ── Step 4: Generate audio for each chapter
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "generating" },
  });

  const audioDir = path.join(process.cwd(), "public", "audio", audiobookId);
  await mkdir(audioDir, { recursive: true });

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const percent = 65 + Math.round((i / chapters.length) * 32);
    updateJob(
      audiobookId,
      "generating",
      `Narrating chapter ${i + 1} of ${chapters.length}: "${chapter.title}"...`,
      percent
    );

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
  }

  // ── Complete
  await db.audiobook.update({
    where: { id: audiobookId },
    data: { status: "complete" },
  });

  updateJob(audiobookId, "complete", "Your audiobook is ready!", 100);
}
