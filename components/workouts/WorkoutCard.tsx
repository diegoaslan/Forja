import Link from "next/link";
import { Dumbbell, Clock, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countTotalSets } from "@/lib/mock-workouts";
import type { Workout } from "@/lib/mock-workouts";

const CATEGORY_STYLES: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  push:   { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-400", label: "Push"      },
  pull:   { badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-400",   label: "Pull"      },
  legs:   { badge: "bg-green-100 text-green-700",   dot: "bg-green-400",  label: "Pernas"    },
  upper:  { badge: "bg-purple-100 text-purple-700", dot: "bg-purple-400", label: "Upper"     },
  lower:  { badge: "bg-teal-100 text-teal-700",     dot: "bg-teal-400",   label: "Lower"     },
  full:   { badge: "bg-rose-100 text-rose-700",     dot: "bg-rose-400",   label: "Full Body" },
  cardio: { badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400", label: "Cardio"    },
};

function formatLastDone(isoDate?: string): string {
  if (!isoDate) return "Nunca realizado";
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  if (diff < 7) return `${diff} dias atrás`;
  return new Date(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const style = CATEGORY_STYLES[workout.category] ?? CATEGORY_STYLES.full;
  const totalSets = countTotalSets(workout);

  return (
    <Card className="border-0 card-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Corpo */}
        <Link
          href={`/workouts/${workout.id}`}
          className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
        >
          {/* Ícone com dot de categoria */}
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Dumbbell className="h-5 w-5 text-muted-foreground" strokeWidth={1.8} />
            </div>
            <span
              className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card", style.dot)}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{workout.name}</span>
              <Badge className={cn("text-xs font-medium shrink-0", style.badge)} variant="outline">
                {style.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3" />
                {workout.exercises.length} exercícios · {totalSets} séries
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{workout.estimatedMinutes}min
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatLastDone(workout.lastDoneAt)}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>

        {/* CTA iniciar */}
        <div className="px-4 pb-3 pt-0">
          <Link
            href={`/workouts/start/${workout.id}`}
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full gap-2"
            )}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            Iniciar treino
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
