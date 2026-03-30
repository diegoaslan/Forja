export function HabitsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Hero */}
      <div className="mx-4 mt-4 h-24 rounded-3xl bg-muted shimmer" />

      {/* Weekly */}
      <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
        <div className="h-3 w-20 rounded bg-muted mb-3" />
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-2.5 w-5 rounded bg-muted" />
              <div className="h-9 w-9 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Habit rows */}
      <div className="mx-4 rounded-2xl bg-card card-shadow overflow-hidden divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="h-10 w-10 rounded-2xl bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-2.5 w-20 rounded bg-muted" />
            </div>
            <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
