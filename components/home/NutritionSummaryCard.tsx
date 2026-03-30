import Link from "next/link";
import { Utensils, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MockNutrition } from "@/lib/mock-data";

interface NutritionSummaryCardProps {
  nutrition: MockNutrition;
}

function MacroBar({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const isOver = current > target;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={cn("text-muted-foreground", isOver && "text-rose-500 font-medium")}>
          {current}
          <span className="opacity-60">/{target}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isOver ? "bg-rose-500" : color
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function NutritionSummaryCard({ nutrition }: NutritionSummaryCardProps) {
  const { calories, macros } = nutrition;
  const calPct = Math.min((calories.current / calories.target) * 100, 100);
  const calRemaining = calories.target - calories.current;

  return (
    <Link href="/nutrition" className="block">
      <Card className="border-0 card-shadow hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                <Utensils className="h-4 w-4 text-blue-600" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold">Nutrição</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Calorias */}
          <div className="space-y-1.5">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold tabular-nums">
                  {calories.current.toLocaleString("pt-BR")}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  / {calories.target.toLocaleString("pt-BR")} kcal
                </span>
              </div>
              <span className={cn(
                "text-xs font-medium",
                calRemaining > 0 ? "text-muted-foreground" : "text-rose-500"
              )}>
                {calRemaining > 0
                  ? `${calRemaining} restantes`
                  : `${Math.abs(calRemaining)} acima`}
              </span>
            </div>

            {/* Barra de calorias */}
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  calPct >= 100 ? "bg-rose-500" : "bg-primary"
                )}
                style={{ width: `${calPct}%` }}
              />
            </div>
          </div>

          {/* Macros */}
          <div className="space-y-2">
            {macros.map((m) => (
              <MacroBar key={m.label} {...m} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
