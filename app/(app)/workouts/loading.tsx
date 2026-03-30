import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function WorkoutsLoading() {
  return (
    <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
      <div className="h-6 w-32 rounded bg-muted shimmer" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
