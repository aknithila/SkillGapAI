"use client";

// Clickable tech word. Usage: <Term word="SQL">SQL</Term>
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ExplainCard from "./ExplainCard";

export default function Term({ word, children }: { word?: string; children: React.ReactNode }) {
  const lookup = word ?? (typeof children === "string" ? children : "");
  if (!lookup) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-help text-indigo-700 underline decoration-indigo-400 decoration-dotted underline-offset-4 hover:bg-indigo-50"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]">
        {/* Only rendered while open, so nothing loads until the user clicks */}
        <ExplainCard word={lookup} />
      </PopoverContent>
    </Popover>
  );
}
