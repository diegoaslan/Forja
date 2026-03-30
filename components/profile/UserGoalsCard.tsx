import { Target, Dumbbell, Utensils } from "lucide-react";

interface UserGoalsCardProps {
  currentWeight: number | null;
  weightGoal: number | null;
  weightToGoal: number | null;
  workoutsThisWeek: number;
  caloriesTarget: number;
  proteinTarget: number;
  dietAdherencePct: number;
}

export function UserGoalsCard({
  currentWeight,
  weightGoal,
  weightToGoal,
  workoutsThisWeek,
  caloriesTarget,
  proteinTarget,
  dietAdherencePct,
}: UserGoalsCardProps) {
  const pct =
    weightToGoal !== null && currentWeight !== null && weightGoal !== null
      ? Math.min(
          100,
          Math.round(
            (1 - weightToGoal / (currentWeight - weightGoal + weightToGoal)) * 100
          )
        )
      : 0;

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Metas ativas
        </p>
      </div>

      <div className="divide-y divide-border">
        {/* Weight goal */}
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold">Meta de peso</p>
                <p className="text-xs font-semibold text-primary">{pct}%</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentWeight?.toFixed(1).replace(".", ",") ?? "–"} → {weightGoal ?? "–"} kg
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workout frequency */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Dumbbell className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Frequência de treino</p>
              <p className="text-xs text-muted-foreground">4x por semana</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {workoutsThisWeek}/4 sem.
            </span>
          </div>
        </div>

        {/* Nutrition */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Utensils className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Meta calórica</p>
              <p className="text-xs text-muted-foreground">
                {caloriesTarget} kcal · {proteinTarget}g proteína
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {dietAdherencePct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
