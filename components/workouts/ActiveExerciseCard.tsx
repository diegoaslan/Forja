"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExerciseSetRow } from "./ExerciseSetRow";
import { cn } from "@/lib/utils";
import type { SessionExercise } from "@/store/workoutSessionStore";

const MUSCLE_COLORS: Record<string, string> = {
  chest:     "bg-orange-100 text-orange-700",
  back:      "bg-blue-100 text-blue-700",
  shoulders: "bg-purple-100 text-purple-700",
  biceps:    "bg-teal-100 text-teal-700",
  triceps:   "bg-pink-100 text-pink-700",
  legs:      "bg-green-100 text-green-700",
  glutes:    "bg-rose-100 text-rose-700",
  core:      "bg-amber-100 text-amber-700",
  calves:    "bg-lime-100 text-lime-700",
};

interface ActiveExerciseCardProps {
  exercise: SessionExercise;
  exerciseIndex: number;
  isFirst?: boolean;
  onToggleSet: (exIdx: number, setIdx: number) => void;
  onUpdateReps: (exIdx: number, setIdx: number, reps: number) => void;
  onUpdateWeight: (exIdx: number, setIdx: number, weight: number) => void;
}

export function ActiveExerciseCard({
  exercise,
  exerciseIndex,
  isFirst = false,
  onToggleSet,
  onUpdateReps,
  onUpdateWeight,
}: ActiveExerciseCardProps) {
  const [expanded, setExpanded] = useState(isFirst);

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = exercise.sets.length;
  const allDone = completedSets === totalSets;
  const muscleColor =
    MUSCLE_COLORS[exercise.exerciseId.split("_")[0]] ??
    "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "rounded-2xl bg-card card-shadow overflow-hidden transition-all",
        allDone && "opacity-80"
      )}
    >
      {/* Header do exercício */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        {/* Status icon */}
        <div className="shrink-0">
          {allDone ? (
            <CheckCircle2
              className="h-6 w-6 text-primary"
              strokeWidth={2}
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-bold text-muted-foreground">
                {exerciseIndex + 1}
              </span>
            </div>
          )}
        </div>

        {/* Nome + grupo muscular */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p
            className={cn(
              "font-semibold text-sm truncate",
              allDone && "line-through text-muted-foreground"
            )}
          >
            {exercise.name}
          </p>
          <div className="flex items-center gap-2">
            <Badge
              className={cn("text-xs", muscleColor)}
              variant="outline"
            >
              {exercise.muscleGroupName}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {completedSets}/{totalSets} séries
            </span>
          </div>
        </div>

        {/* Mini progress + expand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-0.5">
            {exercise.sets.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  s.completed ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Séries (expandido) */}
      {expanded && (
        <div className="border-t border-border">
          {/* Header das colunas */}
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/30">
            <div className="w-7" />
            <div className="flex flex-1 items-center gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[88px] text-center">
                Peso (kg)
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[88px] text-center">
                Reps
              </span>
            </div>
            <div className="w-10" />
          </div>

          <div className="divide-y divide-border/50">
            {exercise.sets.map((set, setIdx) => (
              <ExerciseSetRow
                key={setIdx}
                set={set}
                setIndex={setIdx}
                exerciseIndex={exerciseIndex}
                onToggle={onToggleSet}
                onUpdateReps={onUpdateReps}
                onUpdateWeight={onUpdateWeight}
              />
            ))}
          </div>

          {/* Nota do exercício */}
          {exercise.notes && (
            <div className="px-4 py-2.5 bg-muted/20 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                💡 {exercise.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
