"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Link2, Loader2, ThumbsUp, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Skeleton from "@/components/Skeleton";
import Term from "@/components/Term";
import TermText from "@/components/TermText";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import fallbackRoadmap from "@/data/fallbacks/roadmap.json";
import type { Evaluation, Project, Roadmap } from "@/lib/types";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { loaded, roadmap, evaluations, setEvaluation } = useStore();
  const { toast } = useToast();
  const [githubUrl, setGithubUrl] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Look in the user's roadmap first, then the demo roadmap
  const allWeeks = [...(roadmap?.weeks ?? []), ...(fallbackRoadmap as Roadmap).weeks];
  const project: Project | undefined = allWeeks.find((w) => w.project.id === params.id)?.project;
  const evaluation = evaluations[params.id];

  async function submit() {
    if (!project) return;
    if (explanation.trim().length < 30) {
      toast({ title: "Tell us a bit more", description: "Write at least a few sentences about what you built and how." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, submission: { githubUrl: githubUrl || undefined, explanation } }),
      });
      if (!res.ok) throw new Error();
      setEvaluation(project.id, (await res.json()) as Evaluation);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast({ title: "Evaluation failed", description: "Please check your internet and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return <Skeleton className="h-96" />;

  if (!project) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle>Project not found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/roadmap">Back to roadmap</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/roadmap" className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to roadmap
      </Link>

      {evaluation && <EvaluationResult evaluation={evaluation} />}

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            <Term word={project.skill}>{project.skill}</Term>
          </Badge>
          <CardTitle className="text-2xl">{project.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            <TermText text={project.brief} />
          </p>
          <div>
            <h3 className="mb-2 font-semibold">What we&apos;ll check</h3>
            <ul className="space-y-2">
              {project.criteria.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  <span>
                    <TermText text={c} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{evaluation ? "Improve and resubmit" : "Submit your work"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-sm font-medium">
              <Link2 className="h-4 w-4" /> <Term word="GitHub">GitHub</Term> link (optional)
            </label>
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-name/your-project"
            />
            <p className="text-xs text-slate-500">
              Upload your code to a <Term word="repository">repository</Term> and paste the link here.
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Explain what you built</label>
            <Textarea
              rows={7}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="What did you build? Which steps did you follow? What did you find out? What was hard?"
            />
          </div>
          <Button size="lg" className="w-full" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI is reviewing your work…
              </>
            ) : (
              "Submit for evaluation"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function EvaluationResult({ evaluation }: { evaluation: Evaluation }) {
  const passed = evaluation.verdict === "Demonstrated";
  return (
    <Card className={passed ? "border-emerald-200" : "border-amber-200"}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>AI evaluation</CardTitle>
          <Badge className={passed ? "bg-emerald-600 hover:bg-emerald-600" : "bg-amber-500 hover:bg-amber-500"}>
            {passed && <CheckCircle2 className="mr-1 h-3 w-3" />}
            {evaluation.verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-5xl font-bold text-indigo-600">
            {evaluation.score}
            <span className="text-xl text-slate-400">/100</span>
          </p>
          <Progress value={evaluation.score} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Criterion</th>
                <th className="py-2 pr-3 font-medium">Score</th>
                <th className="py-2 font-medium">Comment</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.rubric.map((r) => (
                <tr key={r.criterion} className="border-b align-top last:border-0">
                  <td className="py-2 pr-3 font-medium">
                    <TermText text={r.criterion} />
                  </td>
                  <td className="whitespace-nowrap py-2 pr-3">{r.score}/10</td>
                  <td className="py-2 text-slate-600">
                    <TermText text={r.comment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-1 font-semibold text-emerald-700">
              <ThumbsUp className="h-4 w-4" /> Strengths
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {evaluation.strengths.map((s) => (
                <li key={s}>
                  <TermText text={s} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1 font-semibold text-amber-700">
              <TrendingUp className="h-4 w-4" /> To improve
            </h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {evaluation.improvements.map((s) => (
                <li key={s}>
                  <TermText text={s} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
