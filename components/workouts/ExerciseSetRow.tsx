"use client";

import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionSet } from "@/store/workoutSessionStore";

interface ExerciseSetRowProps {
  set: SessionSet;
  setIndex: number;
  exerciseIndex: number;
  onToggle: (exIdx: number, setIdx: number) => void;
  onUpdateReps: (exIdx: number, setIdx: number, reps: number) => void;
  onUpdateWeight: (exIdx: number, setIdx: number, weight: number) => void;
}

function NumericStepper({
  value,
  onChange,
  min = 0,
  step = 1,
  unit,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={disabled || value <= min}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg bg-muted",
          "transition-colors active:bg-muted/60 disabled:opacity-30"
        )}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-12 text-center text-sm font-semibold tabular-nums">
        {step < 1 ? value.toFixed(1) : value}
        {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + step)}
        disabled={disabled}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg bg-muted",
          "transition-colors active:bg-muted/60 disabled:opacity-30"
        )}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export function ExerciseSetRow({
  set,
  setIndex,
  exerciseIndex,
  onToggle,
  onUpdateReps,
  onUpdateWeight,
}: ExerciseSetRowProps) {
  const { setNumber, actualReps, weightKg, completed } = set;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        completed && "bg-primary/5"
      )}
    >
      {/* Número da série */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
          completed
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {completed ? <Check className="h-3.5 w-3.5" /> : setNumber}
      </div>

      {/* Steppers */}
      <div className="flex flex-1 items-center gap-4">
        {/* Peso */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">KG</span>
          <NumericStepper
            value={weightKg}
            onChange={(v) => onUpdateWeight(exerciseIndex, setIndex, v)}
            min={0}
            step={2.5}
            disabled={completed}
          />
        </div>

        <span className="text-muted-foreground text-sm">×</span>

        {/* Reps */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-muted-foreground font-medium">REPS</span>
          <NumericStepper
            value={actualReps}
            onChange={(v) => onUpdateReps(exerciseIndex, setIndex, v)}
            min={1}
            step={1}
            disabled={completed}
          />
        </div>
      </div>

      {/* Botão completar */}
      <button
        type="button"
        onClick={() => onToggle(exerciseIndex, setIndex)}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
          "active:scale-90",
          completed
            ? "bg-primary text-primary-foreground shadow-sm"
            : "border-2 border-muted-foreground/30 text-muted-foreground hover:border-primary/50"
        )}
      >
        <Check className="h-5 w-5" strokeWidth={completed ? 2.5 : 1.5} />
      </button>
    </div>
  );
}
