import { splitIntoChunks } from "./utils";

const BASE_URL = "https://api.elevenlabs.io/v1";

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
  labels: Record<string, string>;
}

export async function getVoices(): Promise<ElevenLabsVoice[]> {
  const res = await fetch(`${BASE_URL}/voices`, {
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch voices");
  const data = await res.json();
  return data.voices as ElevenLabsVoice[];
}

async function generateChunk(
  text: string,
  voiceId: string,
  previousRequestId?: string
): Promise<Buffer> {
  const body: Record<string, unknown> = {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.80,
      style: 0.25,
      use_speaker_boost: true,
    },
    output_format: "mp3_44100_128",
  };

  if (previousRequestId) {
    body.previous_request_ids = [previousRequestId];
  }

  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs TTS error: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateChapterAudio(
  text: string,
  voiceId: string
): Promise<Buffer> {
  const chunks = splitIntoChunks(text, 4500);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const buf = await generateChunk(chunk, voiceId);
    buffers.push(buf);
  }

  return Buffer.concat(buffers);
}
