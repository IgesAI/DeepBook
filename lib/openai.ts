import OpenAI from "openai";
import { sleep } from "./utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT_ENRICHER = `You are helping create research for an in-depth audiobook. Take the user's topic and craft a detailed research prompt that will:

1. Explore the topic comprehensively from multiple angles
2. Focus on compelling narratives, pivotal moments, key figures, and fascinating details
3. Cover historical context, current understanding, and future implications
4. Seek out surprising, counterintuitive, or little-known findings
5. Find human stories and concrete examples that bring the topic to life
6. Gather diverse perspectives and expert viewpoints

The research will be transformed into an engaging audiobook, so emphasize storytelling material over dry facts. Write the prompt as a direct instruction to a research AI.

Return ONLY the research prompt, nothing else.`;

const AUDIOBOOK_FORMATTER = `You are a master audiobook scriptwriter. Transform the provided research into a polished, engaging audiobook script.

STRUCTURE:
- An "INTRODUCTION" section that hooks the listener and previews what they will discover
- 4 to 7 chapters, each covering a distinct aspect of the topic
- A "CONCLUSION" section that synthesizes insights and leaves the listener with something to think about

CHAPTER FORMAT — use this exact format for each chapter heading:
CHAPTER [NUMBER]: [COMPELLING TITLE]

WRITING RULES:
- Write exclusively in flowing narrative prose — no bullet points, numbered lists, or markdown headers
- Use a warm, authoritative narrator voice — like a knowledgeable friend sharing something fascinating
- Convert all statistics into relatable comparisons and vivid descriptions
- Add smooth, natural transitions between ideas ("What makes this remarkable is...", "To understand why, we need to go back to...")
- Use occasional rhetorical questions to maintain engagement
- Each chapter should be 800–1,200 words of spoken prose
- Remove ALL citations, URLs, footnote markers, and source references — weave the information naturally into the narrative
- DO NOT include stage directions, [brackets], or (audio cues) of any kind
- Write ONLY the words the narrator speaks

TONE: Authoritative yet conversational. Maintain consistent energy. Explain complex ideas in plain language without condescension.

Begin immediately with "INTRODUCTION" — do not add any preamble.`;

export async function enrichPrompt(
  topic: string,
  answers?: Record<string, string>
): Promise<string> {
  let userContent = `Topic: ${topic}`;

  if (answers && Object.keys(answers).length > 0) {
    const lines = Object.entries(answers)
      .map(([q, a]) => `- ${q}: ${a}`)
      .join("\n");
    userContent += `\n\nListener preferences:\n${lines}`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: PROMPT_ENRICHER },
      { role: "user", content: userContent },
    ],
    max_tokens: 1000,
  });
  return response.choices[0].message.content || topic;
}

export async function runDeepResearch(
  prompt: string,
  onProgress: (msg: string) => void
): Promise<string> {
  onProgress("Submitting research request...");

  // Start background deep research
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initial = await (openai as any).responses.create({
    model: "o4-mini-deep-research",
    input: prompt,
    tools: [{ type: "web_search_preview" }],
    background: true,
  });

  const responseId: string = initial.id;
  let elapsed = 0;

  while (true) {
    await sleep(12000);
    elapsed += 12;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (openai as any).responses.retrieve(responseId);

    if (result.status === "completed") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msgItem = result.output?.find((o: any) => o.type === "message");
      const text: string = msgItem?.content?.[0]?.text || "";
      if (!text) throw new Error("Deep research returned no content");
      return text;
    }

    if (result.status === "failed" || result.status === "cancelled") {
      throw new Error(`Deep research ${result.status}`);
    }

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    onProgress(
      `Researching across the web... (${minutes}m ${seconds}s elapsed)`
    );

    if (elapsed > 1200) throw new Error("Deep research timed out after 20 minutes");
  }
}

export async function formatAsAudiobook(
  research: string,
  topic: string
): Promise<{ title: string; chapters: { title: string; content: string }[] }> {
  // First, generate a book title
  const titleRes = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "user",
        content: `Generate a compelling, concise audiobook title (4-8 words) for a book about: "${topic}". Return ONLY the title, no quotes or punctuation at the end.`,
      },
    ],
    max_tokens: 50,
  });
  const title = titleRes.choices[0].message.content?.trim() || topic;

  // Format as audiobook script
  const formatRes = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: AUDIOBOOK_FORMATTER },
      {
        role: "user",
        content: `Transform this research about "${topic}" into an audiobook script:\n\n${research}`,
      },
    ],
    max_tokens: 12000,
  });

  const script = formatRes.choices[0].message.content || "";

  // Parse chapters from script
  const chapters = parseChapters(script);

  return { title, chapters };
}

function parseChapters(
  script: string
): { title: string; content: string }[] {
  const chapterRegex = /^(INTRODUCTION|CHAPTER\s+\d+:\s*.+|CONCLUSION)$/im;
  const parts = script.split(chapterRegex).filter((p) => p.trim());

  const chapters: { title: string; content: string }[] = [];
  let i = 0;

  while (i < parts.length) {
    const part = parts[i].trim();
    if (chapterRegex.test(part)) {
      const content = parts[i + 1]?.trim() || "";
      if (content) {
        // Clean the title
        const title = part
          .replace(/^CHAPTER\s+\d+:\s*/i, "")
          .replace(/^INTRODUCTION$/i, "Introduction")
          .replace(/^CONCLUSION$/i, "Conclusion")
          .trim();
        chapters.push({ title, content });
      }
      i += 2;
    } else {
      i++;
    }
  }

  // Fallback: if parsing failed, treat entire script as one chapter
  if (chapters.length === 0) {
    chapters.push({ title: "Full Audiobook", content: script });
  }

  return chapters;
}
