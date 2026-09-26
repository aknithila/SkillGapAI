import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { GlossarySchema } from "@/lib/schemas";
import fallback from "@/data/fallbacks/explain.json";

const LANGUAGES = { en: "English", ta: "Tamil (தமிழ், Tamil script)", hi: "Hindi (हिन्दी, Devanagari script)" };

const SYSTEM_PROMPT = `You explain technical terms to a first-year college student in India who is NOT from a computer science background.
You receive {term, language, level}.

Write every field in the requested language. Keep the technical term itself in English (e.g. "SQL") so they can search it later.
- "term": the term as given
- "simple": 1-2 short sentences saying what it is and why people use it. No jargon.
- "analogy": 1-2 sentences comparing it to something from everyday Indian life (kirana shop, train ticket, tiffin box, cricket, WhatsApp group, rangoli, auto-rickshaw, etc.)
- "example": 1 sentence showing it used in a real job or app
If level is "simpler", explain like you are talking to a 10-year-old: even shorter, very simple words.

Return ONLY valid JSON, no markdown, matching exactly:
{"term": string, "simple": string, "analogy": string, "example": string}`;

export async function POST(req: Request) {
  let term = "";
  try {
    const body = (await req.json()) as { term: string; language?: "en" | "ta" | "hi"; level?: "simple" | "simpler" };
    term = body.term;
    const language = LANGUAGES[body.language ?? "en"] ?? LANGUAGES.en;
    const result = await askGemini(SYSTEM_PROMPT, { term, language, level: body.level ?? "simple" });
    return NextResponse.json(GlossarySchema.parse(result));
  } catch (err) {
    console.error("[explain] using fallback:", err);
    // The saved example is about SQL; for any other term, say we couldn't load it
    const entry =
      !term || term.toLowerCase() === fallback.term.toLowerCase()
        ? fallback
        : {
            term,
            simple: `Sorry, we couldn't load an explanation for "${term}" right now.`,
            analogy: "Like a phone call that didn't connect — please try again in a moment.",
            example: "Tip: check your internet connection or the GEMINI_API_KEY in .env.local.",
          };
    return NextResponse.json(entry, { headers: { "X-Fallback": "true" } });
  }
}
