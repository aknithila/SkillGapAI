"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Copy, Mic, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import RadarSkills, { type RadarPoint } from "@/components/RadarSkills";
import Skeleton from "@/components/Skeleton";
import Term from "@/components/Term";
import { useStore } from "@/lib/store";
import { getRole, radarData } from "@/lib/skills";
import { useToast } from "@/hooks/use-toast";
import fallbackRoadmap from "@/data/fallbacks/roadmap.json";
import type { Roadmap } from "@/lib/types";

// Everything the profile card shows. It's also packed into the share link (no database needed).
interface ProfileSnapshot {
  name: string;
  persona: string;
  roleTitle: string;
  readiness: number;
  radar: RadarPoint[];
  demonstrated: string[];
  selfReported: string[];
  interviewScore?: number;
}

const personaLabel: Record<string, string> = { student: "Student", graduate: "Graduate", switcher: "Career Switcher" };

// Text ↔ URL-safe string (works with Tamil/Hindi names too)
const encode = (s: ProfileSnapshot) => btoa(unescape(encodeURIComponent(JSON.stringify(s))));
const decode = (s: string) => JSON.parse(decodeURIComponent(escape(atob(s)))) as ProfileSnapshot;

export default function ProfilePage() {
  const store = useStore();
  const { toast } = useToast();
  const [shared, setShared] = useState<ProfileSnapshot | null>(null);
  const [checkedUrl, setCheckedUrl] = useState(false);

  // If the URL has ?data=..., show that shared profile instead of our own
  useEffect(() => {
    const data = new URLSearchParams(window.location.search).get("data");
    if (data) {
      try {
        setShared(decode(data));
      } catch {
        // broken link → just show our own profile
      }
    }
    setCheckedUrl(true);
  }, []);

  const mine = buildSnapshot(store);
  const snapshot = shared ?? mine;

  function copyLink() {
    if (!mine) return;
    const url = `${window.location.origin}/profile?data=${encodeURIComponent(encode(mine))}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast({ title: "Profile link copied!", description: "Share it with recruiters or friends." }))
      .catch(() => toast({ title: "Couldn't copy", description: url }));
  }

  if (!store.loaded || !checkedUrl) return <Skeleton className="h-[32rem]" />;

  if (!snapshot) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle>Your profile is empty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-600">
          <p>Take the assessment to build your skill profile.</p>
          <Button asChild>
            <Link href="/assess">Start the assessment</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {shared && (
        <p className="rounded-md bg-indigo-50 px-3 py-2 text-center text-sm text-indigo-700">
          You&apos;re viewing a shared SkillGap AI profile.
        </p>
      )}

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
              {snapshot.name.charAt(0).toUpperCase() || <User />}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{snapshot.name}</h1>
              <p className="text-indigo-100">
                {personaLabel[snapshot.persona] ?? snapshot.persona} · Aspiring {snapshot.roleTitle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{snapshot.readiness}%</p>
              <p className="text-xs text-indigo-100">job ready</p>
            </div>
          </div>
          <Progress value={snapshot.readiness} className="mt-4 h-2 bg-white/20 [&>div]:bg-white" />
        </div>

        <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
          <div>
            <h2 className="mb-1 font-semibold">Skills vs. role</h2>
            <RadarSkills data={snapshot.radar} />
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="mb-2 flex items-center gap-1 font-semibold text-emerald-700">
                <BadgeCheck className="h-5 w-5" /> Proven with projects
              </h2>
              {snapshot.demonstrated.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No skills proven yet. Finish a <Term word="project">project</Term> from the roadmap to earn one.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {snapshot.demonstrated.map((s) => (
                    <Badge key={s} className="bg-emerald-600 hover:bg-emerald-600">
                      {s} · Demonstrated ✓
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-2 font-semibold text-slate-700">Self-reported</h2>
              <div className="flex flex-wrap gap-2">
                {snapshot.selfReported.map((s) => (
                  <Badge key={s} variant="outline" className="text-slate-600">
                    <Term word={s}>{s}</Term>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h2 className="flex items-center gap-1 font-semibold">
                <Mic className="h-4 w-4 text-indigo-600" /> Mock interview with Gary
              </h2>
              {snapshot.interviewScore !== undefined ? (
                <p className="mt-1 text-2xl font-bold text-indigo-600">
                  {snapshot.interviewScore}
                  <span className="text-sm text-slate-400">/100</span>
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  Not taken yet.{" "}
                  {!shared && (
                    <Link href="/interview" className="text-indigo-600 hover:underline">
                      Practice with Gary →
                    </Link>
                  )}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {shared ? (
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Build your own profile with SkillGap AI</Link>
        </Button>
      ) : (
        <Button size="lg" className="w-full" onClick={copyLink}>
          <Copy className="mr-2 h-4 w-4" /> Copy profile link
        </Button>
      )}
    </div>
  );
}

function buildSnapshot(store: ReturnType<typeof useStore>): ProfileSnapshot | null {
  const { profile, analysis, roadmap, evaluations, interviewReport } = store;
  const role = getRole(profile?.roleId);
  if (!profile || !analysis || !role) return null;

  // A skill is "demonstrated" when its project got the Demonstrated verdict
  const weeks = [...(roadmap?.weeks ?? []), ...(fallbackRoadmap as Roadmap).weeks];
  const demonstrated = Array.from(
    new Set(weeks.filter((w) => evaluations[w.project.id]?.verdict === "Demonstrated").map((w) => w.project.skill))
  );
  const selfReported = analysis.extractedSkills.map((s) => s.name).filter((n) => !demonstrated.includes(n));

  return {
    name: profile.name,
    persona: profile.persona,
    roleTitle: role.title,
    readiness: analysis.readiness,
    radar: radarData(role, analysis),
    demonstrated,
    selfReported,
    interviewScore: interviewReport?.overallScore,
  };
}
