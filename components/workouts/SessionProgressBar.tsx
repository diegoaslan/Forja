"use client";

import { cn } from "@/lib/utils";

interface SessionProgressBarProps {
  completedSets: number;
  totalSets: number;
  elapsedSeconds: number;
  className?: string;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SessionProgressBar({
  completedSets,
  totalSets,
  elapsedSeconds,
  className,
}: SessionProgressBarProps) {
  const pct = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className={cn("bg-card border-b border-border px-4 py-2.5 space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">
          {completedSets}
          <span className="text-muted-foreground font-normal"> / {totalSets} séries</span>
        </span>
        <span className="font-mono text-muted-foreground">{formatElapsed(elapsedSeconds)}</span>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct === 100 ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
