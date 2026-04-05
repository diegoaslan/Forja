import Link from "next/link";
import { ArrowLeft, Clock, Dumbbell, Layers } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { countTotalSets } from "@/lib/mock-workouts";
import type { Workout } from "@/lib/mock-workouts";

const CATEGORY_GRADIENTS: Record<string, string> = {
  push:   "from-orange-500 to-amber-500",
  pull:   "from-blue-500 to-cyan-500",
  legs:   "from-green-500 to-emerald-500",
  upper:  "from-purple-500 to-violet-500",
  lower:  "from-teal-500 to-green-500",
  full:   "from-rose-500 to-pink-500",
  cardio: "from-yellow-500 to-orange-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  push: "Push", pull: "Pull", legs: "Pernas",
  upper: "Upper", lower: "Lower", full: "Full Body", cardio: "Cardio",
};

interface WorkoutDetailHeaderProps {
  workout: Workout;
}

export function WorkoutDetailHeader({ workout }: WorkoutDetailHeaderProps) {
  const gradient = CATEGORY_GRADIENTS[workout.category] ?? CATEGORY_GRADIENTS.full;
  const totalSets = countTotalSets(workout);

  return (
    <div className={cn("bg-gradient-to-br text-white", gradient)}>
      {/* Safe area top */}
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Back button */}
        <Link
          href="/workouts"
          className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Treinos
        </Link>

        {/* Categoria + Nome */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {CATEGORY_LABELS[workout.category]}
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{workout.name}</h1>
          {workout.description && (
            <p className="text-sm text-white/75 leading-relaxed">{workout.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm text-white/90">
            <Dumbbell className="h-4 w-4" />
            <span>{workout.exercises.length} exercícios</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/90">
            <Layers className="h-4 w-4" />
            <span>{totalSets} séries</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/90">
            <Clock className="h-4 w-4" />
            <span>~{workout.estimatedMinutes}min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
