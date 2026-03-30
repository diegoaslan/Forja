"use server";

import { createClient } from "@/lib/supabase/server";
import type { Workout, WorkoutExercise, Exercise, MuscleGroup } from "@/lib/mock-workouts";
import type { MockWorkout } from "@/lib/mock-data";

// ── DB → domain adapters ──────────────────────────────────────────

type DbWorkout = {
  id: string;
  user_id: string;
  name: string;
  category: "push" | "pull" | "legs" | "upper" | "lower" | "full" | "cardio";
  description: string | null;
  estimated_minutes: number | null;
};

type DbWorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps: string;
  rest_seconds: number;
  default_weight_kg: number | null;
  notes: string | null;
};

type DbExercise = {
  id: string;
  name: string;
  muscle_group_id: string | null;
};

type DbMuscleGroup = {
  id: string;
  name: string;
};

function buildWorkout(
  dbW: DbWorkout,
  dbWEs: DbWorkoutExercise[],
  exercisesMap: Map<string, DbExercise>,
  muscleGroupsMap: Map<string, DbMuscleGroup>,
  lastDoneAt?: string,
): Workout {
  const exercises: WorkoutExercise[] = dbWEs
    .filter((we) => we.workout_id === dbW.id)
    .sort((a, b) => a.order_index - b.order_index)
    .map((we) => {
      const dbEx = exercisesMap.get(we.exercise_id);
      const mg = dbEx?.muscle_group_id
        ? muscleGroupsMap.get(dbEx.muscle_group_id)
        : undefined;
      const muscleGroup: MuscleGroup = {
        id: mg?.id ?? "unknown",
        name: mg?.name ?? "",
      };
      const exercise: Exercise = {
        id: dbEx?.id ?? we.exercise_id,
        name: dbEx?.name ?? "Exercício",
        muscleGroup,
      };
      return {
        id: we.id,
        exercise,
        orderIndex: we.order_index,
        targetSets: we.target_sets,
        targetReps: we.target_reps,
        restSeconds: we.rest_seconds,
        defaultWeightKg: we.default_weight_kg ?? 0,
        notes: we.notes ?? undefined,
      };
    });

  return {
    id: dbW.id,
    name: dbW.name,
    category: dbW.category,
    description: dbW.description ?? "",
    exercises,
    estimatedMinutes: dbW.estimated_minutes ?? 45,
    lastDoneAt,
  };
}

// ── Helper: fetch exercises + muscle groups for a set of workout_exercises ──

async function fetchExerciseMaps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dbWEs: DbWorkoutExercise[],
): Promise<{ exercisesMap: Map<string, DbExercise>; muscleGroupsMap: Map<string, DbMuscleGroup> }> {
  const exercisesMap = new Map<string, DbExercise>();
  const muscleGroupsMap = new Map<string, DbMuscleGroup>();

  const exerciseIds = [...new Set(dbWEs.map((we) => we.exercise_id))];
  if (exerciseIds.length === 0) return { exercisesMap, muscleGroupsMap };

  const { data: exData } = await supabase
    .from("exercises")
    .select("id, name, muscle_group_id")
    .in("id", exerciseIds);

  for (const ex of exData ?? []) {
    exercisesMap.set(ex.id, ex as DbExercise);
  }

  const mgIds = [
    ...new Set(
      (exData ?? [])
        .map((e) => (e as DbExercise).muscle_group_id)
        .filter((id): id is string => id !== null)
    ),
  ];

  if (mgIds.length > 0) {
    const { data: mgData } = await supabase
      .from("muscle_groups")
      .select("id, name")
      .in("id", mgIds);
    for (const mg of mgData ?? []) muscleGroupsMap.set(mg.id, mg);
  }

  return { exercisesMap, muscleGroupsMap };
}

// ── Queries ───────────────────────────────────────────────────────

export async function getWorkouts(): Promise<Workout[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const [workoutsRes, lastSessionsRes] = await Promise.all([
      supabase
        .from("workouts")
        .select("id, user_id, name, category, description, estimated_minutes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("workout_sessions")
        .select("workout_id, started_at")
        .eq("user_id", user.id)
        .not("finished_at", "is", null)
        .order("started_at", { ascending: false }),
    ]);

    const dbWorkouts = (workoutsRes.data ?? []) as DbWorkout[];
    if (dbWorkouts.length === 0) return [];

    const workoutIds = dbWorkouts.map((w) => w.id);

    const { data: weData } = await supabase
      .from("workout_exercises")
      .select(
        "id, workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, default_weight_kg, notes"
      )
      .in("workout_id", workoutIds);

    const dbWEs = (weData ?? []) as DbWorkoutExercise[];

    const { exercisesMap, muscleGroupsMap } = await fetchExerciseMaps(supabase, dbWEs);

    // Most-recent finished session per workout
    const lastDoneMap = new Map<string, string>();
    for (const s of lastSessionsRes.data ?? []) {
      if (s.workout_id && !lastDoneMap.has(s.workout_id)) {
        lastDoneMap.set(s.workout_id, s.started_at);
      }
    }

    return dbWorkouts.map((dbW) =>
      buildWorkout(dbW, dbWEs, exercisesMap, muscleGroupsMap, lastDoneMap.get(dbW.id))
    );
  } catch {
    return [];
  }
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [workoutRes, lastSessionRes] = await Promise.all([
      supabase
        .from("workouts")
        .select("id, user_id, name, category, description, estimated_minutes")
        .eq("id", id)
        .eq("user_id", user.id)
        .single(),

      supabase
        .from("workout_sessions")
        .select("started_at")
        .eq("workout_id", id)
        .eq("user_id", user.id)
        .not("finished_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (!workoutRes.data) return null;

    const { data: weData } = await supabase
      .from("workout_exercises")
      .select(
        "id, workout_id, exercise_id, order_index, target_sets, target_reps, rest_seconds, default_weight_kg, notes"
      )
      .eq("workout_id", id)
      .order("order_index");

    const dbWEs = (weData ?? []) as DbWorkoutExercise[];
    const { exercisesMap, muscleGroupsMap } = await fetchExerciseMaps(supabase, dbWEs);

    return buildWorkout(
      workoutRes.data as DbWorkout,
      dbWEs,
      exercisesMap,
      muscleGroupsMap,
      lastSessionRes.data?.started_at,
    );
  } catch {
    return null;
  }
}

// ── Workout CRUD ──────────────────────────────────────────────────

export async function createWorkout(data: {
  name: string;
  category: DbWorkout["category"];
  description: string;
  estimatedMinutes: number;
  exercises: Array<{
    name: string;
    muscleGroupName: string;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
    defaultWeightKg: number;
  }>;
}): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        name: data.name.trim(),
        category: data.category,
        description: data.description.trim() || null,
        estimated_minutes: data.estimatedMinutes,
      })
      .select("id")
      .single();

    if (wErr || !workout) return null;

    for (let i = 0; i < data.exercises.length; i++) {
      const ex = data.exercises[i];

      // Find or create muscle group by name
      let muscleGroupId: string | null = null;
      if (ex.muscleGroupName.trim()) {
        const { data: existing } = await supabase
          .from("muscle_groups")
          .select("id")
          .eq("name", ex.muscleGroupName.trim())
          .maybeSingle();
        if (existing) {
          muscleGroupId = existing.id;
        } else {
          const { data: created } = await supabase
            .from("muscle_groups")
            .insert({ id: crypto.randomUUID(), name: ex.muscleGroupName.trim() })
            .select("id")
            .single();
          muscleGroupId = created?.id ?? null;
        }
      }

      // Find or create exercise by name
      const { data: existingEx } = await supabase
        .from("exercises")
        .select("id")
        .eq("name", ex.name.trim())
        .maybeSingle();

      let exerciseId: string | null = null;
      if (existingEx) {
        exerciseId = existingEx.id;
      } else {
        const { data: createdEx } = await supabase
          .from("exercises")
          .insert({ name: ex.name.trim(), muscle_group_id: muscleGroupId })
          .select("id")
          .single();
        exerciseId = createdEx?.id ?? null;
      }

      if (!exerciseId) continue;

      await supabase.from("workout_exercises").insert({
        workout_id: workout.id,
        exercise_id: exerciseId,
        order_index: i,
        target_sets: ex.targetSets,
        target_reps: ex.targetReps,
        rest_seconds: ex.restSeconds,
        default_weight_kg: ex.defaultWeightKg || null,
      });
    }

    return workout.id;
  } catch {
    return null;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id);
  } catch {
    // Intentionally silent
  }
}

// ── Session mutations ─────────────────────────────────────────────

/**
 * Creates a workout_sessions row at session start.
 * Returns the DB session ID (used to persist sets on finish).
 */
export async function startWorkoutSession(
  workoutId: string,
  workoutName: string,
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        workout_id: workoutId,
        workout_name: workoutName,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}

export interface FinishSessionExercise {
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  sets: Array<{
    setIndex: number;
    targetReps: string;
    actualReps: number;
    weightKg: number;
    completed: boolean;
    completedAt?: number; // Date.now() timestamp
  }>;
}

/**
 * Closes the session + persists exercises and sets.
 * Called fire-and-forget — does not block the UI.
 */
export async function finishWorkoutSession(
  sessionId: string,
  elapsedSeconds: number,
  exercises: FinishSessionExercise[],
): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. Mark session as finished
    await supabase
      .from("workout_sessions")
      .update({
        finished_at: new Date().toISOString(),
        elapsed_seconds: elapsedSeconds,
      })
      .eq("id", sessionId);

    // 2. Persist exercises + sets sequentially (order matters)
    for (const ex of exercises) {
      const { data: seData } = await supabase
        .from("workout_session_exercises")
        .insert({
          session_id: sessionId,
          exercise_id: ex.exerciseId || null,
          exercise_name: ex.exerciseName,
          order_index: ex.orderIndex,
        })
        .select("id")
        .single();

      if (!seData) continue;

      const setsToInsert = ex.sets.map((s) => ({
        session_exercise_id: seData.id,
        set_index: s.setIndex,
        target_reps: s.targetReps,
        actual_reps: s.actualReps,
        weight_kg: s.weightKg,
        completed: s.completed,
        completed_at: s.completedAt ? new Date(s.completedAt).toISOString() : null,
      }));

      if (setsToInsert.length > 0) {
        await supabase.from("workout_session_sets").insert(setsToInsert);
      }
    }
  } catch {
    // Silent — local state is already correct
  }
}

// ── Home summary ──────────────────────────────────────────────────

/**
 * Returns today's most recent workout session for the Home card.
 * Returns null if no session today.
 */
export async function getWorkoutSummary(): Promise<MockWorkout | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: session } = await supabase
      .from("workout_sessions")
      .select("id, workout_id, workout_name, finished_at, elapsed_seconds")
      .eq("user_id", user.id)
      .gte("started_at", todayStart.toISOString())
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) return null;

    // Resolve category from the workout (best-effort)
    let category = "full";
    if (session.workout_id) {
      const { data: workoutData } = await supabase
        .from("workouts")
        .select("category")
        .eq("id", session.workout_id)
        .single();
      if (workoutData) category = workoutData.category;
    }

    if (!session.finished_at) {
      // Session started but not yet finished
      return {
        name: session.workout_name,
        category,
        status: "scheduled",
        durationMinutes: 0,
        exercisesCount: 0,
        setsTotal: 0,
      };
    }

    // Count completed sets
    const { data: sessionExercises } = await supabase
      .from("workout_session_exercises")
      .select("id")
      .eq("session_id", session.id);

    const seIds = (sessionExercises ?? []).map((se) => se.id);
    let setsTotal = 0;
    if (seIds.length > 0) {
      const { count } = await supabase
        .from("workout_session_sets")
        .select("id", { count: "exact", head: true })
        .in("session_exercise_id", seIds)
        .eq("completed", true);
      setsTotal = count ?? 0;
    }

    return {
      name: session.workout_name,
      category,
      status: "completed",
      durationMinutes: Math.round((session.elapsed_seconds ?? 0) / 60),
      exercisesCount: sessionExercises?.length ?? 0,
      setsTotal,
    };
  } catch {
    return null;
  }
}
