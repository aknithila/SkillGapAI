import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { EvaluationSchema } from "@/lib/schemas";
import fallback from "@/data/fallbacks/evaluate.json";
import type { Project } from "@/lib/types";

const SYSTEM_PROMPT = `You are a fair, encouraging reviewer grading a beginner's mini project.
You receive the project (title, brief, acceptance criteria, skill) and the submission (optional githubUrl, and an explanation written by the student).
You cannot open links, so judge mainly from the explanation. If the explanation is empty or unrelated, give low scores.

For EACH acceptance criterion, add one rubric item: "criterion" (copy the text), "score" 0-10, and a "comment" of 1-2 specific sentences.
"score": overall 0-100 = average rubric score × 10, rounded.
"strengths": 2-3 specific things done well. "improvements": 2-3 specific, actionable next steps.
"verdict": "Demonstrated" if score >= 70, otherwise "Needs work".
Use simple English. Be honest but kind.

Return ONLY valid JSON, no markdown, matching exactly:
{"score": number, "rubric": [{"criterion": string, "score": number, "comment": string}], "strengths": [string], "improvements": [string], "verdict": "Demonstrated"|"Needs work"}`;

export async function POST(req: Request) {
  try {
    const { project, submission } = (await req.json()) as {
      project: Project;
      submission: { githubUrl?: string; explanation: string };
    };
    const result = EvaluationSchema.parse(await askGemini(SYSTEM_PROMPT, { project, submission }));
    // Make sure the verdict always follows the 70-point rule
    result.verdict = result.score >= 70 ? "Demonstrated" : "Needs work";
    return NextResponse.json(result);
  } catch (err) {
    console.error("[evaluate] using fallback:", err);
    return NextResponse.json(fallback, { headers: { "X-Fallback": "true" } });
  }
}
