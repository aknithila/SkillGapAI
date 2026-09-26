import { NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { AnalysisSchema } from "@/lib/schemas";
import fallback from "@/data/fallbacks/analyze.json";
import roles from "@/data/roles.json";
import type { UserProfile } from "@/lib/types";

const SYSTEM_PROMPT = `You are a career-readiness analyst for Indian college students, fresh graduates and career switchers.
You receive a user profile (name, persona, background, optional resumeText, self-rated skills) and the required skills for their target role (each with a required level 1-5 and a weight 1-3).

Your job:
1. extractedSkills: combine the self-rated skills with any skills you can find in resumeText and background. Level 1-5 (1 = heard of it, 5 = expert). Be realistic, not generous.
2. gaps: for every required skill where the user's level is below the required level, add a gap. "current" is the user's level (0 if they don't have it), "required" is the role's level. Use the exact skill names from the role.
   Rank gaps by weight × (required - current), biggest first. Priority: score >= 6 → "High", 3-5 → "Medium", below 3 → "Low".
   "reason": 1-2 simple sentences on why this skill matters for the role. No jargon.
3. readiness: 0-100. Roughly the weighted share of required levels the user already meets.
4. transferable: if persona is "switcher" (or they have work experience), list 2-4 skills from their previous job/studies and how they help in the new role. Otherwise it can be an empty array.

Return ONLY valid JSON, no markdown, matching exactly:
{"readiness": number, "extractedSkills": [{"name": string, "level": number}], "gaps": [{"skill": string, "current": number, "required": number, "priority": "High"|"Medium"|"Low", "reason": string}], "transferable": [{"skill": string, "relevance": string}]}`;

export async function POST(req: Request) {
  try {
    const { profile } = (await req.json()) as { profile: UserProfile };
    const role = roles.find((r) => r.id === profile.roleId);
    if (!role) throw new Error("Unknown role");

    const result = await askGemini(SYSTEM_PROMPT, {
      profile,
      role: { title: role.title, requiredSkills: role.requiredSkills },
    });
    return NextResponse.json(AnalysisSchema.parse(result));
  } catch (err) {
    console.error("[analyze] using fallback:", err);
    return NextResponse.json(fallback, { headers: { "X-Fallback": "true" } });
  }
}
