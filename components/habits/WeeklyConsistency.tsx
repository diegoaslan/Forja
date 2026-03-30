import { cn } from "@/lib/utils";

interface WeekDay {
  date: string;
  label: string;
  isToday: boolean;
  pct: number;
}

interface WeeklyConsistencyProps {
  days: WeekDay[];
}

function dotColor(pct: number, isToday: boolean): string {
  if (pct === 0) return "bg-muted text-muted-foreground";
  if (pct < 50) return "bg-amber-100 text-amber-600";
  if (pct < 100) return "bg-primary/20 text-primary";
  return "bg-primary text-primary-foreground";
}

export function WeeklyConsistency({ days }: WeeklyConsistencyProps) {
  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Esta semana
      </p>
      <div className="flex justify-between">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "text-[11px] font-medium",
                day.isToday ? "text-primary" : "text-muted-foreground"
              )}
            >
              {day.label}
            </span>
            <div
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                dotColor(day.pct, day.isToday),
                day.isToday && "ring-2 ring-primary ring-offset-1"
              )}
            >
              {day.pct === 100
                ? "✓"
                : day.pct > 0
                ? `${day.pct}%`
                : "–"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
