"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { VoiceSelector } from "./VoiceSelector";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
}

const EXAMPLE_TOPICS = [
  "The history of artificial intelligence and its impact on society",
  "How the Roman Empire rose to power and why it fell",
  "The science of sleep: why we dream and how it affects us",
];

export function CreateForm() {
  const router = useRouter();

  const [topic, setTopic] = useState("");

  // Step 2 — interpretation + questions
  const [interpretation, setInterpretation] = useState("");
  const [interpretationConfirmed, setInterpretationConfirmed] = useState<boolean | null>(null);
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

  function resetSteps() {
    setInterpretation("");
    setInterpretationConfirmed(null);
    setQuestions([]);
    setAnswers({});
    setQuestionsReady(false);
  }

  async function fetchQuestions() {
    if (!topic.trim()) return setError("Please enter a topic first.");
    setError("");
    setLoadingQuestions(true);
    resetSteps();

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setInterpretation(data.interpretation || "");
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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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

  const canSubmit = topic.trim() && voiceId;
  const showQuestions = questionsReady && questions.length > 0 && interpretationConfirmed !== false;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Step 1: Topic ── */}
      <div className="space-y-3">
        <label className="block text-sm font-label text-on-surface-variant/70">
          What should your audiobook be about?
        </label>
        <Textarea
          placeholder="Enter any topic, question, person, or area of interest..."
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            resetSteps();
          }}
          rows={3}
          className="text-base leading-relaxed"
          maxLength={500}
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_TOPICS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setTopic(ex); resetSteps(); }}
              className="text-xs px-3 py-1.5 rounded-full glass-card border-0 text-on-surface-variant/50 hover:text-on-surface-variant transition-all"
            >
              {ex.length > 50 ? ex.slice(0, 50) + "…" : ex}
            </button>
          ))}
        </div>

        {/* Refine button */}
        {topic.trim() && !questionsReady && (
          <Button
            type="button"
            variant="glass"
            size="md"
            loading={loadingQuestions}
            onClick={fetchQuestions}
            className="w-full"
          >
            {loadingQuestions ? (
              "Analysing your topic..."
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>auto_fix_high</span>
                Refine your audiobook
              </>
            )}
          </Button>
        )}
      </div>

      {/* ── Step 2a: Topic interpretation / confirmation ── */}
      {questionsReady && interpretation && interpretationConfirmed === null && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em]">
              Confirm topic
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0" style={{ fontSize: "18px" }}>
                lightbulb
              </span>
              <div className="space-y-1">
                <p className="text-xs font-label text-on-surface-variant/50 uppercase tracking-[0.15em]">
                  We understood your topic as:
                </p>
                <p className="text-sm font-label text-on-surface leading-relaxed">{interpretation}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInterpretationConfirmed(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-sm font-label font-medium hover:bg-primary/15 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Yes, that's correct
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterpretationConfirmed(false);
                  resetSteps();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass-card border-0 text-on-surface-variant/60 text-sm font-label hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>edit</span>
                Let me clarify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2b: Clarifying questions ── */}
      {showQuestions && interpretationConfirmed === true && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em]">
              Refine your book
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          {questions.map((q) => (
            <div key={q.id} className="space-y-2.5">
              <p className="text-sm font-label font-medium text-on-surface/80">{q.question}</p>
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
                          ? "bg-primary/10 border-primary/30 text-on-surface"
                          : "glass-card border-0 text-on-surface-variant/60 hover:text-on-surface-variant"
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                          selected ? "border-primary bg-primary" : "border-outline-variant"
                        )}
                      >
                        {selected && (
                          <span className="material-symbols-outlined text-on-primary-fixed" style={{ fontSize: "10px", fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        )}
                      </span>
                      <span className="font-label text-xs">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Step 3: Voice selector ── */}
      {(questionsReady || topic.trim()) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-[0.2em]">
              Narrator voice
            </span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <button
            type="button"
            onClick={() => setShowVoices(!showVoices)}
            className="flex w-full items-center justify-between text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors px-1"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "16px" }}>mic</span>
              {voiceName ? (
                <>
                  <span className="text-on-surface font-label font-medium">{voiceName}</span>
                  <span className="text-on-surface-variant/30 font-label text-xs">· tap to change</span>
                </>
              ) : (
                <span className="font-label">Choose a narrator voice</span>
              )}
            </span>
            <span
              className={cn(
                "material-symbols-outlined transition-transform duration-200",
                showVoices && "rotate-180"
              )}
              style={{ fontSize: "18px" }}
            >
              expand_more
            </span>
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
              className="flex items-center gap-2 px-4 py-3 w-full rounded-2xl glass-card border-dashed border border-outline-variant/30 text-on-surface-variant/30 hover:text-on-surface-variant/60 text-sm font-label transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>record_voice_over</span>
              Browse narrator voices
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm font-label text-error bg-error/10 border border-error/20 rounded-2xl px-4 py-3">
          {error}
        </p>
      )}

      {topic.trim() && (
        <Button
          type="submit"
          variant="amber-fill"
          size="lg"
          loading={loading}
          disabled={!canSubmit}
          className="w-full"
        >
          {loading ? (
            "Starting research..."
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
              Create Audiobook
            </>
          )}
        </Button>
      )}
    </form>
  );
}
