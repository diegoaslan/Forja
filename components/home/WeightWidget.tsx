import Link from "next/link";
import { TrendingDown, TrendingUp, Minus, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MockWeight } from "@/lib/mock-data";

interface WeightWidgetProps {
  weight: MockWeight;
}

export function WeightWidget({ weight }: WeightWidgetProps) {
  const { current, previous, goal } = weight;
  const diff = current - previous;
  const toGoal = current - goal;
  const isDown = diff < 0;
  const isUp = diff > 0;

  const TrendIcon = isDown ? TrendingDown : isUp ? TrendingUp : Minus;
  const trendColor = isDown
    ? "text-green-600"
    : isUp
    ? "text-rose-500"
    : "text-muted-foreground";
  const trendBg = isDown ? "bg-green-50" : isUp ? "bg-rose-50" : "bg-muted";

  return (
    <Link href="/progress" className="block">
      <Card className="border-0 card-shadow hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", trendBg)}>
                <TrendIcon className={cn("h-4 w-4", trendColor)} strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold">Peso</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Valor */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold tabular-nums">{current}</span>
              <span className="ml-1 text-sm text-muted-foreground">kg</span>
            </div>
            {diff !== 0 && (
              <div className={cn("flex items-center gap-0.5 text-sm font-medium", trendColor)}>
                {isDown ? "−" : "+"}{Math.abs(diff).toFixed(1)} kg
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Meta: {goal} kg</span>
            <span className={cn(
              "font-medium",
              toGoal <= 0 ? "text-green-600" : "text-muted-foreground"
            )}>
              {toGoal <= 0
                ? "✓ Meta atingida!"
                : `${toGoal.toFixed(1)} kg restantes`}
            </span>
          </div>

          {/* Progress bar until goal */}
          {toGoal > 0 && previous > goal && (
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((previous - current) / (previous - goal)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
