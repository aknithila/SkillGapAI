// Tech Dictionary lookups, used by <Term> and <AskTerm>.
// English + "simple" comes instantly from glossary.json; everything else asks /api/explain.
import glossaryData from "@/data/glossary.json";
import type { GlossaryEntry } from "./types";

export type Language = "en" | "ta" | "hi";
export type Level = "simple" | "simpler";

export const glossary = glossaryData as GlossaryEntry[];

// Remembers answers while the page is open, so we never ask the AI twice for the same thing
const cache = new Map<string, GlossaryEntry>();

// Finds a glossary entry. Also handles skill names like "Python (Pandas)" or "Power BI / Tableau".
export function findInGlossary(word: string): GlossaryEntry | undefined {
  const tries = [word, word.split(" (")[0], word.split(" / ")[0], word.replace(/s$/i, "")];
  for (const t of tries) {
    const hit = glossary.find((g) => g.term.toLowerCase() === t.trim().toLowerCase());
    if (hit) return hit;
  }
  return undefined;
}

export async function explainTerm(word: string, language: Language, level: Level): Promise<GlossaryEntry> {
  if (language === "en" && level === "simple") {
    const local = findInGlossary(word);
    if (local) return local;
  }

  const key = `${word.toLowerCase()}|${language}|${level}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const res = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ term: word, language, level }),
  });
  if (!res.ok) throw new Error("explain failed");
  const entry = (await res.json()) as GlossaryEntry;
  // Don't cache "sorry, try again" fallbacks
  if (res.headers.get("X-Fallback") !== "true") cache.set(key, entry);
  return entry;
}
