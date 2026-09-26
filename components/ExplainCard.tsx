"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { explainTerm, type Language, type Level } from "@/lib/explain";
import type { GlossaryEntry } from "@/lib/types";

const LANGS: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ta", label: "தமிழ்" },
  { value: "hi", label: "हिन्दी" },
];

// The explanation box: definition, analogy, example, language toggle and "Explain simpler".
export default function ExplainCard({ word }: { word: string }) {
  const [language, setLanguage] = useState<Language>("en");
  const [level, setLevel] = useState<Level>("simple");
  const [entry, setEntry] = useState<GlossaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false; // ignore old answers if the user clicks quickly
    setLoading(true);
    setError(false);
    explainTerm(word, language, level)
      .then((e) => !cancelled && setEntry(e))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [word, language, level]);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-base font-semibold text-indigo-700">{entry?.term ?? word}</h4>
        <div className="flex rounded-md border p-0.5">
          {LANGS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLanguage(l.value)}
              className={cn(
                "rounded px-2 py-0.5 text-xs",
                language === l.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Explaining…
        </div>
      ) : error || !entry ? (
        <p className="py-4 text-slate-600">Couldn&apos;t load this explanation. Please try again.</p>
      ) : (
        <>
          <p className="text-slate-800">{entry.simple}</p>
          <div className="rounded-md bg-amber-50 p-2.5 text-amber-900">
            <p className="mb-0.5 flex items-center gap-1 text-xs font-semibold">
              <Lightbulb className="h-3.5 w-3.5" /> Think of it like…
            </p>
            {entry.analogy}
          </div>
          <div className="rounded-md bg-slate-50 p-2.5 text-slate-700">
            <p className="mb-0.5 flex items-center gap-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Example
            </p>
            {entry.example}
          </div>
        </>
      )}

      <Button
        size="sm"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={() => setLevel(level === "simple" ? "simpler" : "simple")}
      >
        <Wand2 className="mr-2 h-3.5 w-3.5" />
        {level === "simple" ? "Explain simpler" : "Back to normal"}
      </Button>
    </div>
  );
}
