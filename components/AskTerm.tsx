"use client";

// Floating "📖 Ask a term" button (bottom-right on every page). Mounted in app/layout.tsx.
import { useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { glossary } from "@/lib/explain";
import ExplainCard from "./ExplainCard";

export default function AskTerm() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const suggestions = q ? glossary.filter((g) => g.term.toLowerCase().includes(q)).slice(0, 6) : glossary.slice(0, 8);

  function close() {
    setOpen(false);
    setSelected(null);
    setQuery("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
      >
        📖 Ask a term
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-xl border bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        {selected ? (
          <button onClick={() => setSelected(null)} className="flex items-center text-sm text-slate-600 hover:text-indigo-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Search again
          </button>
        ) : (
          <h3 className="font-semibold">📖 Tech Dictionary</h3>
        )}
        <button onClick={close} className="text-slate-400 hover:text-slate-700" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      {selected ? (
        <ExplainCard word={selected} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) setSelected(suggestions[0]?.term ?? query.trim());
          }}
          className="space-y-3"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. API, Docker, Pivot Table…"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((g) => (
              <button
                key={g.term}
                type="button"
                onClick={() => setSelected(g.term)}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-100"
              >
                {g.term}
              </button>
            ))}
          </div>
          {q && suggestions.length === 0 && (
            <button type="submit" className="text-sm text-indigo-600 hover:underline">
              Ask AI to explain &quot;{query.trim()}&quot; →
            </button>
          )}
        </form>
      )}
    </div>
  );
}
