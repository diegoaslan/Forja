import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl shimmer", className)} />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl bg-card card-shadow p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export function SkeletonChecklist({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl bg-card card-shadow divide-y divide-border overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-3.5 flex-1 max-w-40" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHeroCard() {
  return (
    <div className="rounded-2xl bg-muted card-shadow p-5 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export { Skeleton };
