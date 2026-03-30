import type { AnalyticsData } from "@/lib/actions/analytics";
import { cn } from "@/lib/utils";

interface MiniBarProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
}

function MiniBar({ label, current, max, unit, color }: MiniBarProps) {
  const pct = Math.min(100, max > 0 ? Math.round((current / max) * 100) : 0);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {current}<span className="font-normal text-muted-foreground">/{max}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface NutritionAnalyticsCardProps {
  data: AnalyticsData;
}

export function NutritionAnalyticsCard({ data }: NutritionAnalyticsCardProps) {
  const adherence = data.dietAdherencePct;

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Nutrição
        </p>
        <div className={cn(
          "rounded-full px-2 py-0.5 text-xs font-semibold",
          adherence >= 80 ? "bg-green-100 text-green-700" :
          adherence >= 60 ? "bg-amber-100 text-amber-700" :
          "bg-rose-100 text-rose-700"
        )}>
          {adherence}% aderência
        </div>
      </div>

      {/* Calorie highlight */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-2xl font-extrabold">{data.avgCalories}</span>
        <span className="text-sm text-muted-foreground">kcal/dia</span>
        <span className="ml-auto text-xs text-muted-foreground">
          meta: {data.caloriesTarget}
        </span>
      </div>

      {/* Macro bars */}
      <div className="space-y-2.5">
        <MiniBar label="Proteína"    current={data.avgProtein} max={data.proteinTarget} unit="g" color="bg-blue-500"  />
        <MiniBar label="Carboidratos" current={data.avgCarbs}   max={data.carbsTarget}   unit="g" color="bg-amber-400" />
        <MiniBar label="Gorduras"    current={data.avgFats}    max={data.fatsTarget}    unit="g" color="bg-rose-400"  />
      </div>
    </div>
  );
}
