"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { TrendingDown, TrendingUp, Target } from "lucide-react";
import type { AnalyticsData } from "@/lib/actions/analytics";
import { cn } from "@/lib/utils";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold">{payload[0].value.toFixed(1)} kg</p>
    </div>
  );
}

interface ProgressAnalyticsCardProps {
  data: AnalyticsData;
}

export function ProgressAnalyticsCard({ data }: ProgressAnalyticsCardProps) {
  const { currentWeight, monthWeightChange, weightToGoal, weightGoal, weightChartData } = data;
  const isLosing = monthWeightChange !== null && monthWeightChange < 0;

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Progresso corporal
        </p>
        {weightGoal !== null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{weightGoal} kg</span>
          </div>
        )}
      </div>

      {/* Weight + trend */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-2xl font-extrabold">
          {currentWeight?.toFixed(1).replace(".", ",") ?? "–"} kg
        </span>
        {monthWeightChange !== null && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-semibold",
            isLosing ? "text-green-500" : "text-rose-500"
          )}>
            {isLosing
              ? <TrendingDown className="h-3.5 w-3.5" />
              : <TrendingUp   className="h-3.5 w-3.5" />}
            <span>{monthWeightChange > 0 ? "+" : ""}{monthWeightChange.toFixed(1)} kg/mês</span>
          </div>
        )}
      </div>

      {weightToGoal !== null && weightToGoal > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {weightToGoal.toFixed(1)} kg restantes para a meta
        </p>
      )}

      {/* Sparkline */}
      {weightChartData.length > 1 ? (
        <ResponsiveContainer width="100%" height={64}>
          <LineChart
            data={weightChartData}
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
          >
            <XAxis dataKey="date" hide />
            <Tooltip content={<CustomTooltip />} />
            {weightGoal !== null && (
              <ReferenceLine
                y={weightGoal}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          {weightChartData.length === 0
            ? "Nenhum registro de peso ainda"
            : "Registre mais pesagens para ver o gráfico"}
        </p>
      )}
    </div>
  );
}
