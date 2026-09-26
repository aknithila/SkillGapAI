import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { RoadmapSchema } from "@/lib/schemas";
import fallback from "@/data/fallbacks/roadmap.json";
import type { Gap } from "@/lib/types";

const SYSTEM_PROMPT = `You are a friendly learning coach for Indian beginners (students, graduates, career switchers).
You receive a target role and the user's skill gaps (already ranked, most important first).

Create a practical learning roadmap of 4 to 6 weeks that closes the highest-priority gaps first.
Each week has:
- "week": the week number starting at 1
- "focus": one short sentence describing what to learn this week
- "resources": 2-3 FREE, real, named resources (e.g. "Kaggle Learn: Intro to SQL", "freeCodeCamp Responsive Web Design", "Khan Academy: Statistics"). No paid courses.
- "project": one small hands-on mini project that proves the skill:
    - "id": unique, lowercase, url-safe, e.g. "w1-sales-sql"
    - "title": short and catchy
    - "brief": 2-4 sentences describing exactly what to build, with a realistic Indian business/life scenario
    - "criteria": 3-4 clear acceptance criteria that a reviewer can check
    - "skill": the main gap skill this project proves (use the exact gap skill name)

Return ONLY valid JSON, no markdown, matching exactly:
{"weeks": [{"week": number, "focus": string, "resources": [string], "project": {"id": string, "title": string, "brief": string, "criteria": [string], "skill": string}}]}`;

export async function POST(req: Request) {
  try {
    const { roleTitle, gaps } = (await req.json()) as { roleTitle: string; gaps: Gap[] };
    const result = await askGemini(SYSTEM_PROMPT, { roleTitle, gaps });
    return NextResponse.json(RoadmapSchema.parse(result));
  } catch (err) {
    console.error("[roadmap] using fallback:", err);
    return NextResponse.json(fallback, { headers: { "X-Fallback": "true" } });
  }
}
