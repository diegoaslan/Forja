import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEASUREMENT_LABELS } from "@/lib/mock-progress";
import type { BodyMeasurements } from "@/lib/mock-progress";

interface MetricsComparisonCardProps {
  before: BodyMeasurements;
  after: BodyMeasurements;
}

function deltaLabel(before: number | undefined, after: number | undefined): {
  text: string;
  color: string;
  Icon: typeof TrendingDown;
} | null {
  if (before === undefined || after === undefined) return null;
  const delta = Math.round((after - before) * 10) / 10;
  if (delta === 0) return { text: "=", color: "text-muted-foreground", Icon: Minus };

  // For waist/hip/thigh going down is good; for chest/arm going up is good
  const isPositive = delta > 0;
  return {
    text: `${isPositive ? "+" : ""}${delta} cm`,
    color: isPositive ? "text-blue-500" : "text-green-500",
    Icon: isPositive ? TrendingUp : TrendingDown,
  };
}

export function MetricsComparisonCard({ before, after }: MetricsComparisonCardProps) {
  const keys = Object.keys(MEASUREMENT_LABELS) as Array<keyof typeof MEASUREMENT_LABELS>;
  const filled = keys.filter((k) => before[k] !== undefined || after[k] !== undefined);

  const beforeDate = new Date(before.date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  });
  const afterDate = new Date(after.date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  });

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
          Comparação de medidas
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{beforeDate}</span>
          <span className="text-border">→</span>
          <span className="font-semibold text-foreground">{afterDate}</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {filled.map((key) => {
          const info = deltaLabel(before[key], after[key]);
          return (
            <div key={key} className="flex items-center px-4 py-3">
              <span className="text-sm font-medium flex-1">{MEASUREMENT_LABELS[key]}</span>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-14 text-right">
                  {before[key] !== undefined ? `${before[key]} cm` : "–"}
                </span>
                <span className="font-semibold w-14 text-right">
                  {after[key] !== undefined ? `${after[key]} cm` : "–"}
                </span>
                {info && (
                  <div className={cn("flex items-center gap-0.5 w-16 justify-end", info.color)}>
                    <info.Icon className="h-3 w-3 shrink-0" />
                    <span className="text-xs font-semibold">{info.text}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
