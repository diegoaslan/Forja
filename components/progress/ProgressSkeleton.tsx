export function ProgressSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Hero */}
      <div className="mx-4 mt-4 h-36 rounded-3xl bg-muted shimmer" />

      {/* Chart */}
      <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
        <div className="h-3 w-28 rounded bg-muted mb-4" />
        <div className="h-44 rounded-xl bg-muted" />
      </div>

      {/* Body metrics */}
      <div className="mx-4 rounded-2xl bg-card card-shadow overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
        <div className="grid grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 text-center space-y-1.5 border-r border-b border-border last:border-r-0">
              <div className="h-4 w-8 rounded bg-muted mx-auto" />
              <div className="h-2.5 w-10 rounded bg-muted mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
        <div className="h-3 w-32 rounded bg-muted mb-3" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
