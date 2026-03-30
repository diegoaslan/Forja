import Link from "next/link";
import { Dumbbell, CheckCircle2, Clock, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MockWorkout } from "@/lib/mock-data";

const categoryLabels: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Pernas",
  upper: "Upper",
  lower: "Lower",
  full: "Full Body",
  cardio: "Cardio",
};

const categoryColors: Record<string, string> = {
  push: "bg-orange-100 text-orange-700",
  pull: "bg-blue-100 text-blue-700",
  legs: "bg-green-100 text-green-700",
  upper: "bg-purple-100 text-purple-700",
  lower: "bg-teal-100 text-teal-700",
  full: "bg-rose-100 text-rose-700",
  cardio: "bg-yellow-100 text-yellow-700",
};

interface WorkoutSummaryCardProps {
  workout: MockWorkout | null;
}

export function WorkoutSummaryCard({ workout }: WorkoutSummaryCardProps) {
  // Estado: sem treino programado
  if (!workout) {
    return (
      <Card className="border-0 card-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted shrink-0">
            <Calendar className="h-5 w-5 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Dia de descanso</p>
            <p className="text-xs text-muted-foreground">Recuperação é parte do processo.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = workout.status === "completed";

  return (
    <Card className="border-0 card-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0",
              isCompleted ? "bg-primary/10" : "bg-muted"
            )}
          >
            {isCompleted ? (
              <CheckCircle2
                className="h-6 w-6 text-primary"
                strokeWidth={2}
              />
            ) : (
              <Dumbbell
                className="h-5 w-5 text-muted-foreground"
                strokeWidth={1.8}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{workout.name}</p>
              <Badge
                className={cn(
                  "text-xs font-medium shrink-0",
                  categoryColors[workout.category] ?? "bg-muted text-muted-foreground"
                )}
                variant="outline"
              >
                {categoryLabels[workout.category] ?? workout.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isCompleted ? "Treino concluído hoje" : "Programado para hoje"}
            </p>
          </div>
        </div>

        {/* Stats (só se concluído) */}
        {isCompleted && (
          <div className="flex items-center divide-x divide-border border-t border-border">
            <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{workout.durationMinutes}min</span>
            </div>
            <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
              <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{workout.exercisesCount} exercícios</span>
            </div>
            <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
              <span className="text-xs font-medium">{workout.setsTotal} séries</span>
            </div>
          </div>
        )}

        {/* CTA (se não concluído) */}
        {!isCompleted && (
          <div className="px-4 pb-4">
            <Link
              href="/workouts"
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full gap-1.5"
              )}
            >
              <Dumbbell className="h-4 w-4" />
              Iniciar {workout.name}
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
