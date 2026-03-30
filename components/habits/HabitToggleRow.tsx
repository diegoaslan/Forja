"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HabitWithStats } from "@/store/habitsStore";

interface HabitToggleRowProps {
  habit: HabitWithStats;
  onToggle: (id: string) => void;
}

export function HabitToggleRow({ habit, onToggle }: HabitToggleRowProps) {
  const { completedToday } = habit;

  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-200",
        "active:scale-[0.99] hover:bg-muted/40",
        completedToday && "bg-primary/4"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl transition-all duration-200",
          completedToday
            ? "bg-primary/15 scale-105"
            : "bg-muted"
        )}
      >
        {habit.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold transition-colors",
            completedToday && "text-muted-foreground line-through"
          )}
        >
          {habit.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Flame
            className={cn(
              "h-3 w-3 transition-colors",
              habit.streak > 0 ? "text-primary" : "text-muted-foreground/40"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {habit.streak > 0 ? `${habit.streak} dias` : "Iniciar sequência"}
          </span>
          {habit.weeklyRate > 0 && (
            <>
              <span className="text-muted-foreground/30 text-xs">·</span>
              <span className="text-xs text-muted-foreground">{habit.weeklyRate}% sem.</span>
            </>
          )}
        </div>
      </div>

      {/* Toggle circle */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          completedToday
            ? "bg-primary border-primary text-white scale-110"
            : "border-muted-foreground/25"
        )}
      >
        {completedToday && (
          <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,7 5.5,10.5 12,3.5" />
          </svg>
        )}
      </div>
    </button>
  );
}
