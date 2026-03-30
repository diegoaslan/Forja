import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MockStreak } from "@/lib/mock-data";

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface StreakWidgetProps {
  streak: MockStreak;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
  const { current, best, weeklyDone } = streak;

  return (
    <Card className="border-0 card-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50">
              <Flame className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold">Streak</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary tabular-nums">
              {current}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">dias</span>
          </div>
        </div>

        {/* Semana visual */}
        <div className="flex items-end justify-between gap-1">
          {DAY_LABELS.map((day, i) => {
            const done = weeklyDone[i];
            const isToday = i === new Date().getDay();

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-lg transition-colors",
                    done
                      ? "bg-primary"
                      : "bg-muted",
                    isToday && !done && "ring-2 ring-primary/40 ring-offset-1",
                    "aspect-square max-w-8"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recorde */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground">Melhor sequência</span>
          <span className="text-xs font-semibold">
            🏆 {best} dias
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
