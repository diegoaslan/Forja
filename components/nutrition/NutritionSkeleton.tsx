export function NutritionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Hero skeleton */}
      <div className="mx-4 mt-4 h-28 rounded-3xl bg-muted shimmer" />

      {/* Macro bars skeleton */}
      <div className="mx-4 rounded-2xl bg-card card-shadow p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
            <div className="h-2 rounded-full bg-muted" />
          </div>
        ))}
      </div>

      {/* Meal sections skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mx-4 rounded-2xl bg-card card-shadow p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-2.5 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
