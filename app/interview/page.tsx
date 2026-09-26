"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, RotateCcw, Send, ThumbsUp, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import TermText from "@/components/TermText";
import { useStore } from "@/lib/store";
import { getRole } from "@/lib/skills";
import { cn } from "@/lib/utils";
import type { ChatMessage, InterviewReport } from "@/lib/types";

const TOTAL = 5;

interface GaryReply {
  feedback?: string;
  nextQuestion?: string;
  done?: boolean;
  report?: InterviewReport;
}

export default function InterviewPage() {
  const { profile, analysis, interviewReport, setInterviewReport } = useStore();
  const roleTitle = getRole(profile?.roleId)?.title ?? "Data Analyst";

  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0); // questions Gary has asked
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function askGary(history: ChatMessage[], asked: number) {
    setTyping(true);
    setError("");
    try {
      const res = await fetch("/api/gary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleTitle, gaps: analysis?.gaps ?? [], messages: history, questionNumber: asked }),
      });
      if (!res.ok) throw new Error();
      const reply = (await res.json()) as GaryReply;

      const newMessages: ChatMessage[] = [];
      if (reply.feedback) newMessages.push({ role: "gary", text: reply.feedback });
      if (reply.nextQuestion) newMessages.push({ role: "gary", text: reply.nextQuestion });
      setMessages([...history, ...newMessages]);

      if (reply.done && reply.report) {
        setReport(reply.report);
        setInterviewReport(reply.report);
      } else {
        setQuestionNumber(asked + 1);
      }
    } catch {
      setError("Gary lost connection for a moment. Please try sending again.");
    } finally {
      setTyping(false);
    }
  }

  function start() {
    setStarted(true);
    setMessages([]);
    setQuestionNumber(0);
    setReport(null);
    askGary([], 0);
  }

  function send() {
    const text = input.trim();
    if (!text || typing) return;
    const history: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(history);
    setInput("");
    askGary(history, questionNumber);
  }

  function retry() {
    // Resend the conversation as it is (the last message is the user's answer, or empty at the start)
    askGary(messages, questionNumber);
  }

  // ---------- End screen ----------
  if (report) {
    return <Scorecard report={report} roleTitle={roleTitle} onRestart={start} />;
  }

  // ---------- Start screen ----------
  if (!started) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="space-y-5 pt-8">
          <GaryAvatar className="mx-auto h-16 w-16 text-2xl" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Hi, I&apos;m Gary! 👋</h1>
            <p className="text-slate-600">
              Ready for your <span className="font-semibold text-indigo-700">{roleTitle}</span> mock interview?
            </p>
            <p className="text-sm text-slate-500">
              5 questions: 3 technical {analysis ? "(on your skill gaps)" : ""} + 2 about you. Take your time — I&apos;ll
              give tips after each answer.
            </p>
          </div>
          {!analysis && (
            <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-800">
              Tip: <Link href="/assess" className="underline">take the assessment</Link> first so I can ask about your
              own skill gaps.
            </p>
          )}
          <Button size="lg" onClick={start}>
            <Mic className="mr-2 h-4 w-4" /> Start interview
          </Button>
          {interviewReport && (
            <p className="text-sm text-slate-500">Your last score: {interviewReport.overallScore}/100</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ---------- Chat screen ----------
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">{roleTitle} interview</span>
          <span className="text-slate-500">
            Question {Math.max(questionNumber, 1)} of {TOTAL}
          </span>
        </div>
        <Progress value={(questionNumber / TOTAL) * 100} />
      </div>

      <Card>
        <CardContent className="h-[55vh] space-y-4 overflow-y-auto pt-6">
          {messages.map((m, i) =>
            m.role === "gary" ? (
              <div key={i} className="flex items-start gap-2">
                <GaryAvatar className="h-8 w-8 shrink-0 text-sm" />
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm text-slate-800">
                  <TermText text={m.text} />
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2 text-sm text-white">
                  {m.text}
                </div>
              </div>
            )
          )}

          {typing && (
            <div className="flex items-center gap-2">
              <GaryAvatar className="h-8 w-8 text-sm" />
              <div className="flex gap-1 rounded-2xl bg-slate-100 px-4 py-3">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}{" "}
              <button onClick={retry} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      <div className="flex items-end gap-2">
        <Textarea
          rows={2}
          value={input}
          disabled={typing}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter makes a new line
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
        />
        <Button onClick={send} disabled={typing || !input.trim()} className="h-[60px]">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}

function GaryAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-indigo-600 font-bold text-white", className)}>
      G
    </div>
  );
}

function Scorecard({
  report,
  roleTitle,
  onRestart,
}: {
  report: InterviewReport;
  roleTitle: string;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 text-center text-white">
          <p className="text-sm text-indigo-100">{roleTitle} mock interview</p>
          <p className="text-6xl font-bold">
            {report.overallScore}
            <span className="text-2xl text-indigo-200">/100</span>
          </p>
          <p className="mt-1 text-indigo-100">
            {report.overallScore >= 75
              ? "Excellent! You're interview-ready. 🎉"
              : report.overallScore >= 50
                ? "Good effort! A bit more practice and you'll shine."
                : "Great start — every interview makes you better."}
          </p>
        </div>
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 flex items-center gap-1 font-semibold text-emerald-700">
              <ThumbsUp className="h-4 w-4" /> Strengths
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {report.strengths.map((s) => (
                <li key={s}>
                  <TermText text={s} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 flex items-center gap-1 font-semibold text-amber-700">
              <TrendingUp className="h-4 w-4" /> To improve
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {report.improvements.map((s) => (
                <li key={s}>
                  <TermText text={s} />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills to practice</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {report.skillsToPractice.map((s) => (
            <Link
              key={s}
              href="/roadmap"
              className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-100"
            >
              {s} →
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
        <Button asChild className="flex-1">
          <Link href="/profile">See my skill profile</Link>
        </Button>
      </div>
    </div>
  );
}
