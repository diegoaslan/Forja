"use server";

import { createClient } from "@/lib/supabase/server";
import type { Habit, HabitLog } from "@/lib/mock-habits";

// ── Type adapters ─────────────────────────────────────────────────

type DbHabit = {
  id: string;
  name: string;
  icon: string;
  category: string;
  target_days: string[] | null;
  target_count: number | null;
  target_unit: string | null;
  is_active: boolean;
  created_at: string;
};

type DbHabitLog = {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  count: number | null;
};

function dbHabitToLocal(row: DbHabit): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? "✅",
    category: (row.category as Habit["category"]) ?? "custom",
    targetDays: row.target_days === null ? "daily" : (row.target_days as Habit["targetDays"]),
    targetCount: row.target_count ?? undefined,
    targetUnit: row.target_unit ?? undefined,
  };
}

function dbLogToLocal(row: DbHabitLog): HabitLog {
  return {
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed,
    count: row.count ?? undefined,
  };
}

// ── Helpers ───────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function nDaysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function habitAppliesToDay(habit: Habit, d: Date): boolean {
  if (habit.targetDays === "daily") return true;
  return habit.targetDays.includes(WEEKDAYS[d.getDay()]);
}

// ── Queries ───────────────────────────────────────────────────────

/**
 * Fetch the current user's active habits + last 45 days of logs.
 * Returns empty arrays on error or when the user has no habits yet.
 */
export async function getHabitsWithLogs(): Promise<{
  habits: Habit[];
  logs: HabitLog[];
}> {
  try {
    const supabase = await createClient();

    const [habitsRes, logsRes] = await Promise.all([
      supabase
        .from("habits")
        .select("id, name, icon, category, target_days, target_count, target_unit, is_active, created_at")
        .eq("is_active", true)
        .order("created_at"),
      supabase
        .from("habit_logs")
        .select("id, habit_id, date, completed, count")
        .gte("date", nDaysAgoISO(45))
        .order("date", { ascending: false }),
    ]);

    if (habitsRes.error || !habitsRes.data?.length) {
      return { habits: [], logs: [] };
    }

    return {
      habits: habitsRes.data.map(dbHabitToLocal),
      logs: (logsRes.data ?? []).map(dbLogToLocal),
    };
  } catch {
    return { habits: [], logs: [] };
  }
}

/**
 * Derived summary for the Home page:
 * - currentStreak: consecutive days where all applicable habits were completed
 * - weeklyDone: boolean[7] (Sun=0 … Sat=6), current week
 * - completedToday / totalToday: counters for DailyProgressCard
 * - todayHabits: today's applicable habits (id, name, icon) for DailyChecklist
 * - completedTodayIds: IDs already completed today
 */
export async function getHabitsSummary(): Promise<{
  currentStreak: number;
  weeklyDone: boolean[];
  completedToday: number;
  totalToday: number;
  todayHabits: Array<{ id: string; name: string; icon: string }>;
  completedTodayIds: string[];
}> {
  const FALLBACK = {
    currentStreak: 0,
    weeklyDone: Array<boolean>(7).fill(false),
    completedToday: 0,
    totalToday: 0,
    todayHabits: [],
    completedTodayIds: [],
  };

  try {
    const { habits, logs } = await getHabitsWithLogs();
    if (!habits.length) return FALLBACK;

    const today = todayISO();
    const now = new Date();

    // --- completedToday / totalToday ---
    const todayHabits = habits.filter((h) => habitAppliesToDay(h, now));
    const completedToday = todayHabits.filter((h) =>
      logs.find((l) => l.habitId === h.id && l.date === today && l.completed)
    ).length;
    const totalToday = todayHabits.length;

    // --- weeklyDone (Sun–Sat of the current week) ---
    const weeklyDone = Array.from({ length: 7 }, (_, dayIndex) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (now.getDay() - dayIndex));

      // Future days → false
      if (d > now) return false;

      const dateStr = d.toISOString().slice(0, 10);
      const dayHabits = habits.filter((h) => habitAppliesToDay(h, d));
      if (!dayHabits.length) return false;

      return dayHabits.every((h) =>
        logs.find((l) => l.habitId === h.id && l.date === dateStr && l.completed)
      );
    });

    // --- currentStreak (consecutive days all applicable habits done) ---
    let currentStreak = 0;
    const checkDate = new Date(now);

    for (let i = 0; i < 90; i++) {
      const dateStr = checkDate.toISOString().slice(0, 10);
      const dayHabits = habits.filter((h) => habitAppliesToDay(h, checkDate));

      if (dayHabits.length > 0) {
        const allDone = dayHabits.every((h) =>
          logs.find((l) => l.habitId === h.id && l.date === dateStr && l.completed)
        );
        if (!allDone) break;
        currentStreak++;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    const completedTodayIds = todayHabits
      .filter((h) => logs.find((l) => l.habitId === h.id && l.date === today && l.completed))
      .map((h) => h.id);

    const todayHabitsSimple = todayHabits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
    }));

    return { currentStreak, weeklyDone, completedToday, totalToday, todayHabits: todayHabitsSimple, completedTodayIds };
  } catch {
    return FALLBACK;
  }
}

// ── Habit CRUD ────────────────────────────────────────────────────

export async function createHabit(data: {
  name: string;
  icon: string;
  category: string;
  targetDays: string[] | null; // null = "daily"
  targetCount?: number;
  targetUnit?: string;
}): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase.from("habits").insert({
      user_id: user.id,
      name: data.name.trim(),
      icon: data.icon || "✅",
      category: data.category as "health" | "fitness" | "mindset" | "custom",
      target_days: data.targetDays,
      target_count: data.targetCount ?? null,
      target_unit: data.targetUnit ?? null,
      is_active: true,
    });

    return { success: !error };
  } catch {
    return { success: false };
  }
}

export async function deleteHabit(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("habits").update({ is_active: false }).eq("id", id);
  } catch {
    // Intentionally silent
  }
}

// ── Mutations ─────────────────────────────────────────────────────

/**
 * Upsert a habit log entry for the authenticated user.
 * Propaga erros para que o caller possa fazer rollback do estado optimista.
 */
export async function toggleHabitLog(
  habitId: string,
  date: string,
  completed: boolean
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("habit_logs")
    .upsert(
      { habit_id: habitId, user_id: user.id, date, completed },
      { onConflict: "habit_id,date" }
    );

  if (error) {
    console.error("[toggleHabitLog] falha ao salvar hábito:", error.message);
    throw new Error(`Falha ao salvar hábito: ${error.message}`);
  }
}
