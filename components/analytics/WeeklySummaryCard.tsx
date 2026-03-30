import { Dumbbell, Utensils, CheckSquare, Scale } from "lucide-react";
import type { AnalyticsData } from "@/lib/actions/analytics";

interface StatTileProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub?: string;
}

function StatTile({ icon, value, label, sub }: StatTileProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-muted/50">
      <div className="flex items-center justify-between">
        <div className="h-7 w-7 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {sub && (
          <span className="text-[10px] font-semibold text-muted-foreground">{sub}</span>
        )}
      </div>
      <div>
        <p className="text-lg font-extrabold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

interface WeeklySummaryCardProps {
  data: AnalyticsData;
}

export function WeeklySummaryCard({ data }: WeeklySummaryCardProps) {
  const weightChange = data.monthWeightChange;

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Resumo da semana
      </p>
      <div className="grid grid-cols-2 gap-2">
        <StatTile
          icon={<Dumbbell className="h-3.5 w-3.5" />}
          value={`${data.workoutsThisWeek}x`}
          label="Treinos"
          sub={`${data.setsThisWeek} séries`}
        />
        <StatTile
          icon={<Utensils className="h-3.5 w-3.5" />}
          value={`${data.avgCalories}`}
          label="Média kcal/dia"
          sub={`${data.avgProtein}g prot.`}
        />
        <StatTile
          icon={<CheckSquare className="h-3.5 w-3.5" />}
          value={`${data.habitCompletionPct}%`}
          label="Hábitos concluídos"
          sub={`🔥 ${data.currentStreak} dias`}
        />
        <StatTile
          icon={<Scale className="h-3.5 w-3.5" />}
          value={`${data.currentWeight?.toFixed(1).replace(".", ",") ?? "–"} kg`}
          label="Peso atual"
          sub={weightChange !== null
            ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} 30d`
            : undefined}
        />
      </div>
    </div>
  );
}
