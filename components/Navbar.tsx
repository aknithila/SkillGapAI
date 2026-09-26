"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Assess", href: "/assess" },
  { label: "Gaps", href: "/gaps" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Projects", href: "/project" }, // matches /project/[id]
  { label: "Profile", href: "/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const current = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <Sparkles className="h-5 w-5" />
          SkillGap AI
        </Link>
        <Link
          href="/interview"
          className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          🎤 Practice with Gary
        </Link>
      </div>

      {/* Progress stepper (hidden on the landing page) */}
      {pathname !== "/" && (
        <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 pb-3 text-sm">
          {steps.map((step, i) => {
            const done = current > i;
            const active = current === i;
            return (
              <div key={step.label} className="flex items-center gap-1">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    done && "bg-indigo-600 text-white",
                    active && "bg-indigo-600 text-white ring-4 ring-indigo-100",
                    !done && !active && "bg-slate-200 text-slate-500"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn("whitespace-nowrap", active ? "font-semibold text-indigo-700" : "text-slate-500")}>
                  {step.label}
                </span>
                {i < steps.length - 1 && <span className="mx-2 h-px w-6 bg-slate-300 sm:w-10" />}
              </div>
            );
          })}
        </nav>
      )}
    </header>
  );
}
