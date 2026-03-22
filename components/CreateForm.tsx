"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { VoiceSelector } from "./VoiceSelector";
import { BookOpen, Wand2, ChevronDown, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
}

const EXAMPLE_TOPICS = [
  "The history of artificial intelligence and its future impact on society",
  "How the Roman Empire rose to power and why it eventually fell",
  "The science of sleep: why we dream and how it shapes our health",
];

export function CreateForm() {
  const router = useRouter();

  // Step 1 — topic
  const [topic, setTopic] = useState("");

  // Step 2 — clarifying questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);

  // Step 3 — voice
  const [voiceId, setVoiceId] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [showVoices, setShowVoices] = useState(false);

  // Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchQuestions() {
    if (!topic.trim()) return setError("Please enter a topic first.");
    setError("");
    setLoadingQuestions(true);
    setQuestionsReady(false);
    setAnswers({});

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setQuestionsReady(true);
    } catch {
      setError("Failed to generate questions. You can still continue without them.");
      setQuestionsReady(true);
    } finally {
      setLoadingQuestions(false);
    }
  }

  function selectAnswer(questionId: string, option: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic.trim()) return setError("Please enter a topic.");
    if (!voiceId) return setError("Please select a narrator voice.");

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/audiobooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          voiceId,
          voiceName,
          answers: Object.keys(answers).length > 0 ? answers : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start");
      }

      const audiobook = await res.json();
      router.push(`/audiobook/${audiobook.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id]);
  const canSubmit = topic.trim() && voiceId;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Step 1: Topic ── */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/70">
          What should your audiobook be about?
        </label>
        <Textarea
          placeholder="Enter any topic, question, or area of interest..."
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setQuestionsReady(false);
            setQuestions([]);
            setAnswers({});
          }}
          rows={3}
          className="text-base leading-relaxed"
          maxLength={500}
        />

        {/* Example topics */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_TOPICS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setTopic(ex);
                setQuestionsReady(false);
                setQuestions([]);
                setAnswers({});
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
            >
              {ex.length > 48 ? ex.slice(0, 48) + "…" : ex}
            </button>
          ))}
        </div>

        {/* Refine button */}
        {topic.trim() && !questionsReady && (
          <Button
            type="button"
            variant="outline"
            size="md"
            loading={loadingQuestions}
            onClick={fetchQuestions}
            className="w-full"
          >
            {loadingQuestions ? (
              "Generating questions…"
            ) : (
              <>
                Refine your audiobook
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* ── Step 2: Clarifying questions ── */}
      {questionsReady && questions.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-white/30 uppercase tracking-widest">
              Refine your book
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {questions.map((q) => (
            <div key={q.id} className="space-y-2.5">
              <p className="text-sm font-medium text-white/80">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectAnswer(q.id, opt)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all duration-150",
                        selected
                          ? "bg-amber-500/10 border-amber-500/40 text-white"
                          : "bg-white/[0.03] border-white/[0.07] text-white/50 hover:border-white/15 hover:text-white/80"
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                          selected
                            ? "border-amber-500 bg-amber-500"
                            : "border-white/20"
                        )}
                      >
                        {selected && <Check className="w-2.5 h-2.5 text-black" />}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!allAnswered && (
            <p className="text-xs text-white/25 text-center">
              Answer all questions above to tailor your audiobook, or skip and continue below.
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Voice ── */}
      {(questionsReady || topic.trim()) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-white/30 uppercase tracking-widest">
              Narrator voice
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <button
            type="button"
            onClick={() => setShowVoices(!showVoices)}
            className="flex w-full items-center justify-between text-sm text-white/60 hover:text-white transition-colors px-1"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              {voiceName ? (
                <>
                  <span className="text-white font-medium">{voiceName}</span>
                  <span className="text-white/30">· tap to change</span>
                </>
              ) : (
                "Choose a narrator voice"
              )}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                showVoices && "rotate-180"
              )}
            />
          </button>

          {showVoices && (
            <VoiceSelector
              value={voiceId}
              onChange={(id, name) => {
                setVoiceId(id);
                setVoiceName(name);
                setShowVoices(false);
              }}
            />
          )}

          {!showVoices && !voiceId && (
            <button
              type="button"
              onClick={() => setShowVoices(true)}
              className="flex items-center gap-2 px-4 py-3 w-full rounded-xl bg-white/[0.03] border border-dashed border-white/[0.12] text-white/30 hover:border-white/20 hover:text-white/50 text-sm transition-all"
            >
              <Wand2 className="w-4 h-4" />
              Browse narrator voices
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Submit — only show once topic is entered */}
      {topic.trim() && (
        <Button
          type="submit"
          variant="amber"
          size="lg"
          loading={loading}
          disabled={!canSubmit}
          className="w-full"
        >
          {loading ? "Starting deep research…" : "Create Audiobook"}
        </Button>
      )}
    </form>
  );
}
