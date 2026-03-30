/**
 * Tipos e helpers de treinos — usados em toda a aplicação.
 * Os dados mockados foram removidos na ETAPA 5 (substituídos pelo Supabase).
 */

export interface MuscleGroup {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  orderIndex: number;
  targetSets: number;
  targetReps: string;       // "8-12" | "5" | "AMRAP" | "15-20"
  restSeconds: number;
  notes?: string;
  defaultWeightKg: number;  // pré-preenchido na sessão
}

export interface Workout {
  id: string;
  name: string;
  category: "push" | "pull" | "legs" | "upper" | "lower" | "full" | "cardio";
  description: string;
  exercises: WorkoutExercise[];
  lastDoneAt?: string;      // ISO date string
  estimatedMinutes: number;
}

// ── Helpers ──────────────────────────────────────────────────────

/** Extrai o número alvo de reps de uma string como "8-12" ou "15" */
export function parseTargetReps(reps: string): number {
  if (reps === "AMRAP") return 12;
  const range = reps.match(/(\d+)-(\d+)/);
  if (range) return parseInt(range[2]); // usa limite superior
  return parseInt(reps) || 10;
}

/** Formata segundos em "Xmin Ys" ou "Xs" */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

/** Total de séries planejadas em um treino */
export function countTotalSets(workout: Workout): number {
  return workout.exercises.reduce((acc, e) => acc + e.targetSets, 0);
}
