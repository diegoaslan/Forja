import { notFound } from "next/navigation";
import { getWorkoutById } from "@/lib/actions/workouts";
import { ActiveWorkoutSession } from "./ActiveWorkoutSession";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StartWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  if (!workout) notFound();

  // Passa os dados do treino para o cliente
  return <ActiveWorkoutSession workout={workout} />;
}
