import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { WorkoutDetailHeader } from "@/components/workouts/WorkoutDetailHeader";
import { ExerciseListItem } from "@/components/workouts/ExerciseListItem";
import { cn } from "@/lib/utils";
import { getWorkoutById } from "@/lib/actions/workouts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const workout = await getWorkoutById(id);
  return { title: workout?.name ?? "Treino" };
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  if (!workout) notFound();

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-screen">
      {/* Header com gradiente */}
      <WorkoutDetailHeader workout={workout} />

      {/* Lista de exercícios */}
      <div className="flex-1 px-4 py-5 space-y-2 max-w-lg mx-auto w-full md:max-w-2xl">
        <h2 className="text-base font-semibold">
          Exercícios <span className="text-muted-foreground font-normal text-sm">({workout.exercises.length})</span>
        </h2>

        <div className="rounded-2xl bg-card card-shadow overflow-hidden divide-y divide-border">
          {workout.exercises.map((item, i) => (
            <ExerciseListItem key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* CTA Iniciar — sticky no mobile */}
      <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 pb-safe md:static md:border-0 md:bg-transparent md:pb-4 md:px-4 md:max-w-lg md:mx-auto md:w-full">
        <Link
          href={`/workouts/start/${workout.id}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full gap-2 text-base")}
        >
          <Dumbbell className="h-5 w-5" />
          Iniciar {workout.name}
        </Link>
      </div>
    </div>
  );
}
