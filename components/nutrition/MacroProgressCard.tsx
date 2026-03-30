import type { MacroTotals, NutritionTarget } from "@/lib/mock-nutrition";

interface MacroProgressCardProps {
  totals: MacroTotals;
  target: NutritionTarget;
}

interface BarProps {
  label: string;
  current: number;
  max: number;
  unit: string;
  barColor: string;
}

function MacroBar({ label, current, max, unit, barColor }: BarProps) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{current}</span>/{max}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MacroProgressCard({ totals, target }: MacroProgressCardProps) {
  return (
    <div className="mx-4 mt-3 rounded-2xl bg-card card-shadow p-4 space-y-3">
      <MacroBar
        label="Proteína"
        current={Math.round(totals.protein * 10) / 10}
        max={target.protein}
        unit="g"
        barColor="bg-blue-500"
      />
      <MacroBar
        label="Carboidratos"
        current={Math.round(totals.carbs * 10) / 10}
        max={target.carbs}
        unit="g"
        barColor="bg-amber-400"
      />
      <MacroBar
        label="Gorduras"
        current={Math.round(totals.fats * 10) / 10}
        max={target.fats}
        unit="g"
        barColor="bg-rose-400"
      />
    </div>
  );
}
