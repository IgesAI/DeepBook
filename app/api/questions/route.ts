import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM = `You generate clarifying questions that help refine an audiobook before deep research begins.

Return ONLY valid JSON in this exact shape:
{
  "questions": [
    { "id": "audience", "question": "Who is this audiobook for?", "options": ["General curious listener", "Students & learners", "Industry professionals", "Personal deep-dive"] },
    { "id": "depth",    "question": "What level of depth do you want?", "options": ["...4 options..."] },
    { "id": "focus",    "question": "...topic-specific question...", "options": ["...4 options..."] }
  ]
}

Rules:
- Question 1 (id: "audience") is ALWAYS the exact audience question shown above with those exact 4 options.
- Question 2 (id: "depth") is ALWAYS about depth/approach — generate 4 options that make sense for this topic.
- Question 3 (id: "focus") is a TOPIC-SPECIFIC question about the most meaningful aspect to focus on — generate both the question and 4 options.
- All options must be concise (under 8 words).
- Output raw JSON only — no markdown, no code fences.`;

export async function POST(req: NextRequest) {
  const { topic } = await req.json();
  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic required" }, { status: 400 });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Topic: ${topic}` },
    ],
    max_tokens: 500,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw);

  return NextResponse.json(data);
}
