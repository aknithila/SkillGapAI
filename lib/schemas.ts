// zod schemas that check the AI's answers match our types in lib/types.ts.
import { z } from "zod";

const level = z.number().min(0).max(5);

export const AnalysisSchema = z.object({
  readiness: z.number().min(0).max(100),
  extractedSkills: z.array(z.object({ name: z.string(), level })),
  gaps: z.array(
    z.object({
      skill: z.string(),
      current: level,
      required: level,
      priority: z.enum(["High", "Medium", "Low"]),
      reason: z.string(),
    })
  ),
  transferable: z.array(z.object({ skill: z.string(), relevance: z.string() })),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  brief: z.string(),
  criteria: z.array(z.string()).min(1),
  skill: z.string(),
});

export const RoadmapSchema = z.object({
  weeks: z
    .array(
      z.object({
        week: z.number(),
        focus: z.string(),
        resources: z.array(z.string()),
        project: ProjectSchema,
      })
    )
    .min(1),
});

export const EvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  rubric: z.array(z.object({ criterion: z.string(), score: z.number(), comment: z.string() })),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  verdict: z.enum(["Demonstrated", "Needs work"]),
});

export const GlossarySchema = z.object({
  term: z.string(),
  simple: z.string(),
  analogy: z.string(),
  example: z.string(),
});
