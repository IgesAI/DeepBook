import { NextResponse } from "next/server";
import { getVoices } from "@/lib/elevenlabs";

// Curated voices well-suited for audiobook narration
const FEATURED_VOICE_IDS = new Set([
  "21m00Tcm4TlvDq8ikWAM", // Rachel
  "AZnzlk1XvdvUeBnXmlld", // Domi
  "EXAVITQu4vr4xnSDxMaL", // Bella
  "ErXwobaYiN019PkySvjV", // Antoni
  "MF3mGyEYCl7XYWbV9V6O", // Elli
  "TxGEqnHWrfWFTfGW9XjX", // Josh
  "VR6AewLTigWG4xSOukaG", // Arnold
  "pNInz6obpgDQGcFmaJgB", // Adam
  "yoZ06aMxZJJ28mfd3POQ", // Sam
  "onwK4e9ZLuTAKqWW03F9", // Daniel
  "g5CIjZEefAph4nQFvHAz", // Ethan
  "N2lVS1w4EtoT3dr4eOWO", // Callum
]);

export async function GET() {
  try {
    const voices = await getVoices();
    // Return featured voices first, then others
    const featured = voices.filter((v) => FEATURED_VOICE_IDS.has(v.voice_id));
    const rest = voices
      .filter((v) => !FEATURED_VOICE_IDS.has(v.voice_id))
      .slice(0, 20);

    return NextResponse.json([...featured, ...rest]);
  } catch {
    // Return a minimal set of well-known voices as fallback
    return NextResponse.json([
      {
        voice_id: "21m00Tcm4TlvDq8ikWAM",
        name: "Rachel",
        preview_url: "",
        category: "premade",
        labels: { accent: "american", description: "calm", use_case: "narration" },
      },
      {
        voice_id: "pNInz6obpgDQGcFmaJgB",
        name: "Adam",
        preview_url: "",
        category: "premade",
        labels: { accent: "american", description: "deep", use_case: "narration" },
      },
      {
        voice_id: "TxGEqnHWrfWFTfGW9XjX",
        name: "Josh",
        preview_url: "",
        category: "premade",
        labels: { accent: "american", description: "deep", use_case: "narration" },
      },
    ]);
  }
}
