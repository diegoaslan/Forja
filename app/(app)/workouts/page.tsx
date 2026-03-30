import type { Metadata } from "next";
import { Flame, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreateWorkoutButton } from "@/components/workouts/CreateWorkoutSheet";
import { getWorkouts } from "@/lib/actions/workouts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Treinos" };

export default async function WorkoutsPage() {
  const workouts = await getWorkouts();

  const weeklyWorkouts = workouts.filter(
    (w) => w.lastDoneAt && Date.now() - new Date(w.lastDoneAt).getTime() < 7 * 86400000
  ).length;

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto md:max-w-2xl md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Treinos</h1>
        <CreateWorkoutButton />
      </div>

      {/* Resumo semanal */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl bg-primary/10 px-4 py-3 flex items-center gap-3">
          <Flame className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-lg font-bold tabular-nums">{weeklyWorkouts}</p>
            <p className="text-xs text-muted-foreground">treinos esta semana</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl bg-muted px-4 py-3 flex items-center gap-3">
          <Dumbbell className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-lg font-bold tabular-nums">{workouts.length}</p>
            <p className="text-xs text-muted-foreground">treinos cadastrados</p>
          </div>
        </div>
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-2 overflow-x-auto scroll-hidden pb-0.5 -mx-4 px-4">
        {["Todos", "Push", "Pull", "Pernas", "Full Body"].map((cat) => (
          <Badge
            key={cat}
            variant={cat === "Todos" ? "default" : "outline"}
            className={cn(
              "shrink-0 cursor-pointer text-xs py-1.5 px-3",
              cat !== "Todos" && "hover:bg-muted"
            )}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Lista de treinos */}
      {workouts.length === 0 ? (
        <EmptyState
          emoji="💪"
          title="Nenhum treino cadastrado"
          description='Toque em "Novo" para criar seu primeiro treino.'
        />
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}
