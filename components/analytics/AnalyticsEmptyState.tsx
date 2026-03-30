export function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-3xl">
        📊
      </div>
      <div>
        <p className="font-semibold">Sem dados suficientes</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use o app por alguns dias para ver seus analytics aqui.
        </p>
      </div>
    </div>
  );
}
