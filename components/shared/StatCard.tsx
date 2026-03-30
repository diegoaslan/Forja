import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  iconClassName?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
  className,
  trend,
}: StatCardProps) {
  return (
    <Card className={cn("border-0 card-shadow", className)}>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              iconClassName ?? "bg-muted"
            )}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-green-600",
                trend === "down" && "text-rose-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground/70">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
