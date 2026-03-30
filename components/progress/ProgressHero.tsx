import { TrendingDown, TrendingUp, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeightEntry, BodyGoal } from "@/lib/mock-progress";

interface ProgressHeroProps {
  latest: WeightEntry;
  monthChange: number | null;
  goal: BodyGoal;
}

export function ProgressHero({ latest, monthChange, goal }: ProgressHeroProps) {
  const toGoal = Math.round((latest.weight - goal.targetWeight) * 10) / 10;
  const pctToGoal = Math.min(100, Math.max(0, Math.round((1 - toGoal / (latest.weight - goal.targetWeight + toGoal)) * 100)));

  const TrendIcon =
    monthChange === null ? Minus
    : monthChange < 0 ? TrendingDown
    : TrendingUp;

  const trendColor =
    monthChange === null ? "text-muted-foreground"
    : monthChange < 0 ? "text-green-500"
    : "text-rose-500";

  return (
    <div className="gradient-primary mx-4 mt-4 rounded-3xl p-5 text-white">
      <div className="flex items-end justify-between mb-4">
        {/* Current weight */}
        <div>
          <p className="text-xs font-medium opacity-75 mb-0.5">Peso atual</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold leading-none">
              {latest.weight.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-base font-medium opacity-80">kg</span>
          </div>
          {monthChange !== null && (
            <div className={cn("flex items-center gap-1 mt-1.5 rounded-full bg-white/20 px-2 py-0.5 w-fit", "text-white")}>
              <TrendIcon className={cn("h-3 w-3", trendColor.replace("text-", "text-"))} />
              <span className="text-xs font-semibold">
                {monthChange > 0 ? "+" : ""}{monthChange.toFixed(1).replace(".", ",")} kg no mês
              </span>
            </div>
          )}
        </div>

        {/* Goal */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end mb-0.5 opacity-75">
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Meta</span>
          </div>
          <span className="text-2xl font-bold">{goal.targetWeight} kg</span>
          <p className="text-xs opacity-70 mt-0.5">
            {toGoal > 0 ? `${toGoal.toFixed(1).replace(".", ",")} kg restantes` : "Meta atingida! 🎉"}
          </p>
        </div>
      </div>

      {/* Goal progress bar */}
      <div>
        <div className="flex justify-between text-xs opacity-75 mb-1.5">
          <span>Progresso até a meta</span>
          <span>{pctToGoal}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/80 transition-all duration-700"
            style={{ width: `${pctToGoal}%` }}
          />
        </div>
      </div>
    </div>
  );
}
