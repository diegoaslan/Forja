"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { AnalyticsData } from "@/lib/actions/analytics";

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
      <p className="font-bold">{payload[0].value} treinos</p>
    </div>
  );
}

interface WorkoutAnalyticsCardProps {
  data: AnalyticsData;
}

export function WorkoutAnalyticsCard({ data }: WorkoutAnalyticsCardProps) {
  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Treinos
        </p>
        <span className="text-xs text-muted-foreground">últimas 8 semanas</span>
      </div>

      {/* Key numbers */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-extrabold">{data.workoutsThisWeek}x</span>
        <span className="text-sm text-muted-foreground">esta semana</span>
        <span className="ml-auto text-sm font-semibold text-muted-foreground">
          {data.setsThisWeek} séries
        </span>
      </div>

      {/* Bar chart */}
      {data.weeklyWorkoutHistory.length > 0 ? (
        <ResponsiveContainer width="100%" height={100}>
          <BarChart
            data={data.weeklyWorkoutHistory}
            barSize={20}
            margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
          >
            <XAxis
              dataKey="week"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide domain={[0, 5]} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.weeklyWorkoutHistory.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.week === "Atual" ? "var(--primary)" : "oklch(0.72 0.22 55 / 0.25)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nenhum treino registrado ainda
        </p>
      )}
    </div>
  );
}
