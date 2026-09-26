"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Hammer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Skeleton from "@/components/Skeleton";
import Term from "@/components/Term";
import TermText from "@/components/TermText";
import { useStore } from "@/lib/store";
import { getRole } from "@/lib/skills";
import type { Roadmap } from "@/lib/types";

export default function RoadmapPage() {
  const { loaded, profile, analysis, roadmap, setRoadmap, evaluations } = useStore();
  const [error, setError] = useState("");
  const started = useRef(false);

  const role = getRole(profile?.roleId);

  async function generate() {
    if (!analysis || !role) return;
    setError("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleTitle: role.title, gaps: analysis.gaps }),
      });
      if (!res.ok) throw new Error();
      setRoadmap((await res.json()) as Roadmap);
    } catch {
      setError("We couldn't build your roadmap right now. Please try again.");
    }
  }

  useEffect(() => {
    if (loaded && analysis && !roadmap && !started.current) {
      started.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, analysis, roadmap]);

  if (loaded && !analysis) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle>Find your gaps first</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={profile ? "/gaps" : "/assess"}>{profile ? "See my gaps" : "Start the assessment"}</Link>
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
          <Button onClick={generate}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!roadmap) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Building your personal week-by-week plan…</p>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your {roadmap.weeks.length}-week roadmap</h1>
        <p className="text-slate-600">
          Learn with free resources, then prove each skill with a hands-on <Term word="project">project</Term>. Put your
          work on <Term word="GitHub">GitHub</Term> so employers can see it.
        </p>
      </div>

      {/* Vertical timeline */}
      <ol className="relative space-y-6 border-l-2 border-indigo-200 pl-6 sm:pl-8">
        {roadmap.weeks.map((w) => {
          const evaluation = evaluations[w.project.id];
          return (
            <li key={w.week} className="relative">
              <span className="absolute -left-[37px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white sm:-left-[45px]">
                {w.week}
              </span>
              <Card>
                <CardHeader className="pb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Week {w.week}</p>
                  <CardTitle className="text-lg">
                    <TermText text={w.focus} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-1 flex items-center gap-1 text-sm font-medium text-slate-700">
                      <BookOpen className="h-4 w-4" /> Free resources
                    </p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm text-slate-600">
                      {w.resources.map((r) => (
                        <li key={r}>
                          <TermText text={r} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Hammer className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-semibold">{w.project.title}</h3>
                      <Badge variant="secondary">
                        <Term word={w.project.skill}>{w.project.skill}</Term>
                      </Badge>
                      {evaluation && (
                        <Badge
                          className={
                            evaluation.verdict === "Demonstrated"
                              ? "bg-emerald-600 hover:bg-emerald-600"
                              : "bg-amber-500 hover:bg-amber-500"
                          }
                        >
                          {evaluation.verdict === "Demonstrated" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {evaluation.verdict} · {evaluation.score}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      <TermText text={w.project.brief} />
                    </p>
                    <Button asChild size="sm" className="mt-3">
                      <Link href={`/project/${w.project.id}`}>{evaluation ? "View / resubmit" : "Start project"}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>

      <Button
        variant="outline"
        onClick={() => {
          setRoadmap(null);
          started.current = false;
        }}
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Regenerate roadmap
      </Button>
    </div>
  );
}
