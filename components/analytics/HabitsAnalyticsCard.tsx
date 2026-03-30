"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { Flame } from "lucide-react";
import type { AnalyticsData } from "@/lib/actions/analytics";
import { cn } from "@/lib/utils";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-bold">{payload[0].value}%</p>
    </div>
  );
}

interface HabitsAnalyticsCardProps {
  data: AnalyticsData;
}

export function HabitsAnalyticsCard({ data }: HabitsAnalyticsCardProps) {
  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Hábitos
        </p>
        <div className="flex items-center gap-1 text-primary">
          <Flame className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">{data.currentStreak} dias</span>
        </div>
      </div>

      {/* Completion pct */}
      <div className="flex items-baseline gap-1.5 mb-4">
        <span className="text-2xl font-extrabold">{data.habitCompletionPct}%</span>
        <span className="text-sm text-muted-foreground">conclusão semanal</span>
      </div>

      {/* Trend chart */}
      {data.weeklyHabitHistory.length > 0 ? (
        <ResponsiveContainer width="100%" height={64}>
          <AreaChart
            data={data.weeklyHabitHistory}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completionPct"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#habitGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-16 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Nenhum hábito registrado ainda</p>
        </div>
      )}

      {/* Top habits */}
      {data.habitBreakdown.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          {data.habitBreakdown.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <span className="text-base leading-none">{h.icon}</span>
              <span className="text-xs font-medium flex-1 truncate">{h.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      h.rate >= 80 ? "bg-green-500" : h.rate >= 50 ? "bg-primary" : "bg-amber-400"
                    )}
                    style={{ width: `${h.rate}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-6 text-right">{h.rate}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
