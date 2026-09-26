// Small helpers shared by the Gaps and Profile pages.
import rolesData from "@/data/roles.json";
import type { AnalysisResult, Role } from "./types";
import type { RadarPoint } from "@/components/RadarSkills";

export const roles = rolesData as Role[];

export function getRole(roleId?: string): Role | undefined {
  return roles.find((r) => r.id === roleId);
}

// Builds radar chart data: every skill the role needs, with the user's current level (0 if missing).
export function radarData(role: Role, analysis: AnalysisResult): RadarPoint[] {
  return role.requiredSkills.map((req) => {
    const found = analysis.extractedSkills.find((s) => s.name.toLowerCase() === req.name.toLowerCase());
    const gap = analysis.gaps.find((g) => g.skill.toLowerCase() === req.name.toLowerCase());
    return {
      skill: req.name,
      required: req.level,
      current: found?.level ?? gap?.current ?? 0,
    };
  });
}
