import { Timer, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/mock-workouts";
import type { WorkoutExercise } from "@/lib/mock-workouts";

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

interface ExerciseListItemProps {
  item: WorkoutExercise;
  index: number;
}

export function ExerciseListItem({ item, index }: ExerciseListItemProps) {
  const muscleColor =
    MUSCLE_COLORS[item.exercise.muscleGroup.id] ?? "bg-muted text-muted-foreground";

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      {/* Número de ordem */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
        <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{item.exercise.name}</span>
          <Badge className={cn("text-xs font-medium", muscleColor)} variant="outline">
            {item.exercise.muscleGroup.name}
          </Badge>
        </div>

        {/* Sets × Reps + descanso */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1 font-medium">
            <RotateCcw className="h-3 w-3" />
            {item.targetSets} × {item.targetReps} reps
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {formatDuration(item.restSeconds)} descanso
          </span>
          {item.defaultWeightKg > 0 && (
            <span className="text-muted-foreground/70">
              ~{item.defaultWeightKg}kg
            </span>
          )}
        </div>

        {/* Notas */}
        {item.notes && (
          <p className="text-xs text-muted-foreground/70 italic">{item.notes}</p>
        )}
      </div>
    </div>
  );
}
