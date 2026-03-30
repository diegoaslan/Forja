export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="mx-4 mt-4 h-24 rounded-3xl bg-muted shimmer" />
      <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
        <div className="h-3 w-28 rounded bg-muted mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mx-4 rounded-2xl bg-card card-shadow p-4 space-y-3">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
}
