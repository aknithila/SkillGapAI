"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import RadarSkills from "@/components/RadarSkills";
import Skeleton from "@/components/Skeleton";
import Term from "@/components/Term";
import TermText from "@/components/TermText";
import { useStore } from "@/lib/store";
import { getRole, radarData } from "@/lib/skills";
import { cn } from "@/lib/utils";
import type { AnalysisResult, Gap } from "@/lib/types";

const priorityStyle: Record<Gap["priority"], string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function GapsPage() {
  const router = useRouter();
  const { loaded, profile, analysis, setAnalysis, setRoadmap } = useStore();
  const [error, setError] = useState("");
  const started = useRef(false); // stops React calling the API twice

  const role = getRole(profile?.roleId);

  async function runAnalysis() {
    if (!profile) return;
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error();
      setAnalysis((await res.json()) as AnalysisResult);
      setRoadmap(null); // new gaps → roadmap needs regenerating
    } catch {
      setError("We couldn't analyse your skills right now. Please check your internet and try again.");
    }
  }

  useEffect(() => {
    if (loaded && profile && !analysis && !started.current) {
      started.current = true;
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, profile, analysis]);

  if (loaded && !profile) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle>No profile yet</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/assess">Start the assessment</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="space-y-4 pt-6">
          <p className="text-slate-700">{error}</p>
          <Button onClick={runAnalysis}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || !role) return <GapsSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {profile?.name}, here&apos;s your gap report for {role.title}
        </h1>
        <p className="text-slate-600">
          Based on your background and <Term word="skill assessment">skills</Term>, compared with what employers expect.
        </p>
      </div>

      {/* Readiness + radar */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-slate-600">Job readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-6xl font-bold text-indigo-600">{analysis.readiness}%</p>
            <Progress value={analysis.readiness} />
            <p className="text-sm text-slate-600">
              {analysis.readiness >= 70
                ? "You're nearly there — polish a few skills and start applying!"
                : analysis.readiness >= 40
                  ? "Good foundation. A focused few weeks will make a big difference."
                  : "Everyone starts somewhere. Your roadmap will take you step by step."}
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base text-slate-600">You vs. the role</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarSkills data={radarData(role, analysis)} />
          </CardContent>
        </Card>
      </div>

      {/* Gaps */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your skill gaps (most important first)</h2>
        {analysis.gaps.length === 0 && <p className="text-slate-600">No gaps found — amazing! 🎉</p>}
        {analysis.gaps.map((gap) => (
          <Card key={gap.skill}>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">
                    <Term word={gap.skill}>{gap.skill}</Term>
                  </h3>
                  <Badge variant="outline" className={cn(priorityStyle[gap.priority])}>
                    {gap.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  <TermText text={gap.reason} />
                </p>
              </div>
              <div className="shrink-0 text-sm">
                <span className="text-slate-500">Level </span>
                <span className="font-semibold">{gap.current}</span>
                <span className="text-slate-400"> → </span>
                <span className="font-semibold text-indigo-600">{gap.required}</span>
                <span className="text-slate-500"> / 5</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Transferable */}
      {analysis.transferable.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-indigo-600" /> Transferable skills you already have
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.transferable.map((t) => (
              <Card key={t.skill} className="border-indigo-100 bg-indigo-50/50">
                <CardContent className="space-y-1 pt-6">
                  <h3 className="font-semibold">{t.skill}</h3>
                  <p className="text-sm text-slate-600">
                    <TermText text={t.relevance} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={() => router.push("/roadmap")}>
          Generate my roadmap <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            setAnalysis(null);
            started.current = false;
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Re-analyse
        </Button>
      </div>
    </div>
  );
}

function GapsSkeleton() {
  return (
    <div className="space-y-6">
      <p className="text-slate-600">Analysing your skills with AI… this takes about 10 seconds.</p>
      <div className="grid gap-6 md:grid-cols-5">
        <Skeleton className="h-56 md:col-span-2" />
        <Skeleton className="h-56 md:col-span-3" />
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}
