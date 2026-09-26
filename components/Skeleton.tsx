import { cn } from "@/lib/utils";

// Grey pulsing box shown while data is loading.
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />;
}
