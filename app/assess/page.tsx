"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import rolesData from "@/data/roles.json";
import type { Persona, Role, UserProfile, UserSkill } from "@/lib/types";

const roles = rolesData as Role[];

const personas: { value: Persona; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "switcher", label: "Career Switcher" },
];

const demoProfile: UserProfile = {
  name: "Priya",
  persona: "graduate",
  roleId: "data-analyst",
  background:
    "B.Com graduate (2024) from Chennai. Worked 6 months as an accounts assistant using Tally and Excel. Enjoy working with numbers and want to move into data analytics.",
  resumeText: "",
  skills: [
    { name: "Excel / Spreadsheets", level: 3 },
    { name: "Business Understanding", level: 4 },
    { name: "Communication & Storytelling", level: 3 },
    { name: "Statistics", level: 2 },
    { name: "SQL", level: 1 },
  ],
};

export default function AssessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, setProfile, setAnalysis, setRoadmap } = useStore();

  // Start from the saved profile if there is one
  const [form, setForm] = useState<UserProfile>(
    profile ?? { name: "", persona: "student", roleId: roles[0].id, background: "", resumeText: "", skills: [] }
  );
  const [mode, setMode] = useState(form.skills.length > 0 ? "skills" : "resume");
  const [newSkill, setNewSkill] = useState("");

  const role = roles.find((r) => r.id === form.roleId);

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addSkill(name: string) {
    const clean = name.trim();
    if (!clean || form.skills.some((s) => s.name.toLowerCase() === clean.toLowerCase())) return;
    update("skills", [...form.skills, { name: clean, level: 3 }]);
    setNewSkill("");
  }

  function setLevel(name: string, level: number) {
    update("skills", form.skills.map((s: UserSkill) => (s.name === name ? { ...s, level } : s)));
  }

  function removeSkill(name: string) {
    update("skills", form.skills.filter((s) => s.name !== name));
  }

  function loadDemo() {
    setForm(demoProfile);
    setMode("skills");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Please enter your name" });
      return;
    }
    if (!form.resumeText?.trim() && form.skills.length === 0) {
      toast({ title: "Add your resume or at least one skill" });
      return;
    }
    setProfile(form);
    // New profile → old results are no longer valid
    setAnalysis(null);
    setRoadmap(null);
    router.push("/gaps");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tell us about yourself</h1>
          <p className="text-slate-600">We&apos;ll compare your skills with what the role needs.</p>
        </div>
        <Button type="button" variant="outline" onClick={loadDemo}>
          <Wand2 className="mr-2 h-4 w-4" /> Load demo profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About you</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">I am a…</label>
            <div className="flex flex-wrap gap-2">
              {personas.map((p) => (
                <Button
                  key={p.value}
                  type="button"
                  variant={form.persona === p.value ? "default" : "outline"}
                  onClick={() => update("persona", p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Target role</label>
            <select
              value={form.roleId}
              onChange={(e) => update("roleId", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            {role && <p className="text-sm text-slate-500">{role.description}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Background</label>
            <Textarea
              value={form.background}
              onChange={(e) => update("background", e.target.value)}
              placeholder="Your degree, work experience, interests…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              <TabsTrigger value="resume">Paste resume</TabsTrigger>
              <TabsTrigger value="skills">Rate skills</TabsTrigger>
            </TabsList>

            <TabsContent value="resume">
              <Textarea
                rows={8}
                value={form.resumeText}
                onChange={(e) => update("resumeText", e.target.value)}
                placeholder="Paste your resume text here. AI will pick out your skills."
              />
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              {/* Quick-add chips from the role's required skills */}
              {role && (
                <div className="flex flex-wrap gap-2">
                  {role.requiredSkills
                    .filter((rs) => !form.skills.some((s) => s.name === rs.name))
                    .map((rs) => (
                      <button
                        key={rs.name}
                        type="button"
                        onClick={() => addSkill(rs.name)}
                        className="rounded-full border border-dashed border-indigo-300 px-3 py-1 text-xs text-indigo-700 hover:bg-indigo-50"
                      >
                        + {rs.name}
                      </button>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(newSkill);
                    }
                  }}
                  placeholder="Add another skill…"
                />
                <Button type="button" variant="secondary" onClick={() => addSkill(newSkill)}>
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {form.skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2">
                    <span className="text-sm font-medium">{s.name}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setLevel(s.name, n)}
                          className={cn(
                            "h-7 w-7 rounded-full text-xs font-semibold",
                            n <= s.level ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                      <button type="button" onClick={() => removeSkill(s.name)} className="ml-2 text-slate-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {form.skills.length === 0 && (
                  <p className="text-sm text-slate-500">No skills yet. Click a chip above or add your own. 1 = beginner, 5 = expert.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full">
        Find my skill gaps →
      </Button>
    </form>
  );
}
