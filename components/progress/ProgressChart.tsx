"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { WeightEntry, BodyGoal } from "@/lib/mock-progress";

interface ProgressChartProps {
  entries: WeightEntry[];
  goal: BodyGoal;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

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
      <p className="font-bold text-sm">
        {payload[0].value.toFixed(1).replace(".", ",")} kg
      </p>
    </div>
  );
}

export function ProgressChart({ entries, goal }: ProgressChartProps) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const data = sorted.map((e) => ({
    label: formatDate(e.date),
    weight: e.weight,
  }));

  const weights = sorted.map((e) => e.weight);
  const minW = Math.floor(Math.min(...weights, goal.targetWeight) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Evolução do peso
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={goal.targetWeight}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        ---- Meta: {goal.targetWeight} kg
      </p>
    </div>
  );
}
