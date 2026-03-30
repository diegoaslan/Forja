import { cn } from "@/lib/utils";

interface HabitCompletionRingProps {
  completed: number;
  total: number;
  size?: number;
}

export function HabitCompletionRing({ completed, total, size = 64 }: HabitCompletionRingProps) {
  const pct = total > 0 ? completed / total : 0;
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * pct;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          className="text-muted/60"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500",
            pct >= 1 ? "text-green-500" : "text-primary"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold leading-none">{completed}</span>
        <span className="text-[10px] text-muted-foreground leading-none">/{total}</span>
      </div>
    </div>
  );
}
