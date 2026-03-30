import { create } from "zustand";
import type { Workout } from "@/lib/mock-workouts";
import { parseTargetReps } from "@/lib/mock-workouts";

// ── Tipos do estado ───────────────────────────────────────────────

export interface SessionSet {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  completed: boolean;
  completedAt?: number; // timestamp
}

export interface SessionExercise {
  workoutExerciseId: string;
  exerciseId: string;
  name: string;
  muscleGroupName: string;
  sets: SessionSet[];
  restSeconds: number;
  notes?: string;
}

export interface RestTimer {
  active: boolean;
  secondsLeft: number;
  totalSeconds: number;
}

export interface ActiveSession {
  workoutId: string;
  workoutName: string;
  exercises: SessionExercise[];
  startedAt: number;        // Date.now()
  elapsedSeconds: number;
  rest: RestTimer;
  isFinished: boolean;
}

// ── Store ─────────────────────────────────────────────────────────

interface WorkoutSessionStore {
  session: ActiveSession | null;
  sessionDbId: string | null; // DB workout_sessions.id, set after startWorkoutSession

  // Setup
  initSession: (workout: Workout) => void;
  setSessionDbId: (id: string) => void;
  resetSession: () => void;

  // Séries
  toggleSetComplete: (exIdx: number, setIdx: number) => void;
  updateSetReps: (exIdx: number, setIdx: number, reps: number) => void;
  updateSetWeight: (exIdx: number, setIdx: number, weight: number) => void;

  // Timer de descanso
  startRest: (seconds: number) => void;
  tickRest: () => void;
  dismissRest: () => void;

  // Timer de sessão
  tickElapsed: () => void;

  // Finalizar
  finishSession: () => void;

  // Computed helpers (derivados do estado atual)
  getTotalSets: () => number;
  getCompletedSets: () => number;
  getProgressPct: () => number;
}

export const useWorkoutSession = create<WorkoutSessionStore>((set, get) => ({
  session: null,
  sessionDbId: null,

  // ── Inicializa a sessão a partir de um Workout ────────────────
  initSession: (workout) => {
    const exercises: SessionExercise[] = workout.exercises.map((we) => ({
      workoutExerciseId: we.id,
      exerciseId: we.exercise.id,
      name: we.exercise.name,
      muscleGroupName: we.exercise.muscleGroup.name,
      restSeconds: we.restSeconds,
      notes: we.notes,
      sets: Array.from({ length: we.targetSets }, (_, i) => ({
        setNumber: i + 1,
        targetReps: parseTargetReps(we.targetReps),
        actualReps: parseTargetReps(we.targetReps), // pré-preenche com alvo
        weightKg: we.defaultWeightKg,
        completed: false,
      })),
    }));

    set({
      session: {
        workoutId: workout.id,
        workoutName: workout.name,
        exercises,
        startedAt: Date.now(),
        elapsedSeconds: 0,
        rest: { active: false, secondsLeft: 0, totalSeconds: 0 },
        isFinished: false,
      },
    });
  },

  setSessionDbId: (id) => set({ sessionDbId: id }),

  resetSession: () => set({ session: null, sessionDbId: null }),

  // ── Marcar/desmarcar série ────────────────────────────────────
  toggleSetComplete: (exIdx, setIdx) => {
    const { session } = get();
    if (!session) return;

    const exercises = session.exercises.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const sets = ex.sets.map((s, si) => {
        if (si !== setIdx) return s;
        return {
          ...s,
          completed: !s.completed,
          completedAt: !s.completed ? Date.now() : undefined,
        };
      });
      return { ...ex, sets };
    });

    const justCompleted =
      !session.exercises[exIdx].sets[setIdx].completed;
    const restSeconds = session.exercises[exIdx].restSeconds;

    set({
      session: {
        ...session,
        exercises,
        // Inicia timer de descanso apenas ao COMPLETAR
        rest: justCompleted
          ? { active: true, secondsLeft: restSeconds, totalSeconds: restSeconds }
          : session.rest,
      },
    });
  },

  updateSetReps: (exIdx, setIdx, reps) => {
    const { session } = get();
    if (!session) return;
    const exercises = session.exercises.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const sets = ex.sets.map((s, si) =>
        si === setIdx ? { ...s, actualReps: Math.max(1, reps) } : s
      );
      return { ...ex, sets };
    });
    set({ session: { ...session, exercises } });
  },

  updateSetWeight: (exIdx, setIdx, weight) => {
    const { session } = get();
    if (!session) return;
    const exercises = session.exercises.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const sets = ex.sets.map((s, si) =>
        si === setIdx ? { ...s, weightKg: Math.max(0, weight) } : s
      );
      return { ...ex, sets };
    });
    set({ session: { ...session, exercises } });
  },

  // ── Timer de descanso ─────────────────────────────────────────
  startRest: (seconds) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        rest: { active: true, secondsLeft: seconds, totalSeconds: seconds },
      },
    });
  },

  tickRest: () => {
    const { session } = get();
    if (!session || !session.rest.active) return;
    const secondsLeft = session.rest.secondsLeft - 1;
    set({
      session: {
        ...session,
        rest:
          secondsLeft <= 0
            ? { active: false, secondsLeft: 0, totalSeconds: session.rest.totalSeconds }
            : { ...session.rest, secondsLeft },
      },
    });
  },

  dismissRest: () => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        rest: { active: false, secondsLeft: 0, totalSeconds: 0 },
      },
    });
  },

  // ── Timer de sessão ───────────────────────────────────────────
  tickElapsed: () => {
    const { session } = get();
    if (!session || session.isFinished) return;
    set({
      session: { ...session, elapsedSeconds: session.elapsedSeconds + 1 },
    });
  },

  // ── Finalizar ─────────────────────────────────────────────────
  finishSession: () => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, isFinished: true } });
  },

  // ── Computed ─────────────────────────────────────────────────
  getTotalSets: () => {
    const { session } = get();
    if (!session) return 0;
    return session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  },

  getCompletedSets: () => {
    const { session } = get();
    if (!session) return 0;
    return session.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
  },

  getProgressPct: () => {
    const store = get();
    const total = store.getTotalSets();
    if (total === 0) return 0;
    return Math.round((store.getCompletedSets() / total) * 100);
  },
}));
