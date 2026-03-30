import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-6 px-4" : "gap-3 py-10 px-6",
        className
      )}
    >
      {(Icon || emoji) && (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-muted",
            compact ? "h-10 w-10" : "h-14 w-14"
          )}
        >
          {emoji ? (
            <span className={compact ? "text-xl" : "text-2xl"}>{emoji}</span>
          ) : Icon ? (
            <Icon
              className={cn(
                "text-muted-foreground",
                compact ? "h-5 w-5" : "h-7 w-7"
              )}
              strokeWidth={1.5}
            />
          ) : null}
        </div>
      )}

      <div className={cn("space-y-1", compact && "space-y-0.5")}>
        <p
          className={cn(
            "font-semibold",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={action.onClick}
          className="mt-1"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
