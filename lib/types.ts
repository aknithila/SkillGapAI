// Shared types for the whole team. Talk to the team before changing these!

export type Persona = "student" | "graduate" | "switcher";

export interface Skill {
  name: string;
  category: string;
  level: number; // 1-5 (required level for the role)
  weight: number; // 1-3 (how important it is)
}

export interface Role {
  id: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
}

export interface UserSkill {
  name: string;
  level: number; // 1-5
}

export interface UserProfile {
  name: string;
  persona: Persona;
  roleId: string;
  background: string;
  resumeText?: string;
  skills: UserSkill[];
}

export interface Gap {
  skill: string;
  current: number;
  required: number;
  priority: "High" | "Medium" | "Low";
  reason: string;
}

export interface AnalysisResult {
  readiness: number; // 0-100
  extractedSkills: UserSkill[];
  gaps: Gap[];
  transferable: { skill: string; relevance: string }[];
}

export interface Project {
  id: string;
  title: string;
  brief: string;
  criteria: string[];
  skill: string;
}

export interface Week {
  week: number;
  focus: string;
  resources: string[];
  project: Project;
}

export interface Roadmap {
  weeks: Week[];
}

export interface Evaluation {
  score: number;
  rubric: { criterion: string; score: number; comment: string }[];
  strengths: string[];
  improvements: string[];
  verdict: "Demonstrated" | "Needs work";
}

export interface GlossaryEntry {
  term: string;
  simple: string;
  analogy: string;
  example: string;
}

// --- Mock interview bot "Gary" ---

export interface ChatMessage {
  role: "gary" | "user";
  text: string;
}

export interface InterviewReport {
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  skillsToPractice: string[];
}
