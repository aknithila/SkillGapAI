import { NextResponse } from "next/server";
import { z } from "zod";
import { askGemini } from "@/lib/gemini";
import fallback from "@/data/fallbacks/gary.json";
import type { ChatMessage, Gap } from "@/lib/types";

// How the interview works:
//   questionNumber = how many questions Gary has asked so far (0-5).
//   0            → return the first question
//   1-4          → give feedback on the last answer + ask the next question
//   5            → give feedback on the last answer + the final report
const TOTAL_QUESTIONS = 5;

const PERSONA = `You are Gary, a friendly and encouraging job interviewer at an Indian company. The candidate is a fresher or career switcher applying for a {ROLE} role.
The interview has exactly 5 questions, asked ONE at a time:
- Questions 1-3: technical, beginner-to-intermediate level, focused on the candidate's skill gaps (listed in "gaps", most important first). One gap per question.
- Questions 4-5: behavioral (teamwork, learning quickly, handling mistakes, explaining things to others).
Keep each question to 1-2 short sentences in simple English. Never repeat a question from the conversation.`;

const NEXT_PROMPT = `${PERSONA}

You receive the conversation so far and "questionNumber" (questions already asked). The last message is the candidate's answer.
Return:
- "feedback": 1-2 warm sentences about their answer. If the answer is weak, vague or wrong, include one concrete tip to improve it.
- "nextQuestion": question number questionNumber+1, following the plan above.

Return ONLY valid JSON, no markdown: {"feedback": string, "nextQuestion": string}`;

const FIRST_PROMPT = `${PERSONA}

The interview is just starting. Return question 1 with a short friendly greeting in front (one sentence).

Return ONLY valid JSON, no markdown: {"nextQuestion": string}`;

const REPORT_PROMPT = `${PERSONA}

The interview is finished. The last message is the answer to question 5. Review ALL the candidate's answers.
Return:
- "feedback": 1-2 warm sentences on the last answer.
- "report":
    - "overallScore": 0-100. Be fair: short, vague or empty answers score low; clear answers with examples score high.
    - "strengths": 2-3 specific things they did well.
    - "improvements": 2-3 specific, actionable tips.
    - "skillsToPractice": 2-4 skill names to practise (prefer the exact names from "gaps").

Return ONLY valid JSON, no markdown:
{"feedback": string, "report": {"overallScore": number, "strengths": [string], "improvements": [string], "skillsToPractice": [string]}}`;

const NextSchema = z.object({ feedback: z.string().optional(), nextQuestion: z.string() });
const ReportSchema = z.object({
  feedback: z.string().optional(),
  report: z.object({
    overallScore: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    skillsToPractice: z.array(z.string()),
  }),
});

export async function POST(req: Request) {
  let questionNumber = 0;
  try {
    const body = (await req.json()) as {
      roleTitle: string;
      gaps: Gap[];
      messages: ChatMessage[];
      questionNumber: number;
    };
    questionNumber = body.questionNumber ?? 0;
    const data = { gaps: body.gaps, messages: body.messages, questionNumber };
    const persona = (p: string) => p.replace("{ROLE}", body.roleTitle || "entry-level tech");

    if (questionNumber >= TOTAL_QUESTIONS) {
      const result = ReportSchema.parse(await askGemini(persona(REPORT_PROMPT), data));
      return NextResponse.json({ done: true, ...result });
    }
    const prompt = questionNumber === 0 ? FIRST_PROMPT : NEXT_PROMPT;
    return NextResponse.json(NextSchema.parse(await askGemini(persona(prompt), data)));
  } catch (err) {
    console.error("[gary] using fallback:", err);
    const headers = { "X-Fallback": "true" };
    if (questionNumber >= TOTAL_QUESTIONS) {
      return NextResponse.json({ done: true, feedback: fallback.feedback, report: fallback.report }, { headers });
    }
    return NextResponse.json(
      {
        feedback: questionNumber === 0 ? undefined : fallback.feedback,
        nextQuestion: fallback.questions[questionNumber],
      },
      { headers }
    );
  }
}
