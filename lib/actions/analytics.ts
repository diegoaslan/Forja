"use server";

import { createClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────

export interface WeeklyWorkoutStat {
  week: string;
  count: number;
  totalSets: number;
}

export interface WeeklyHabitStat {
  week: string;
  completionPct: number;
}

export interface HabitBreakdownItem {
  id: string;
  name: string;
  icon: string;
  rate: number;
}

export interface AnalyticsData {
  weeklyScore: number;

  // Weekly summary
  workoutsThisWeek: number;
  setsThisWeek: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  dietAdherencePct: number;
  habitCompletionPct: number;
  currentStreak: number;
  currentWeight: number | null;
  monthWeightChange: number | null;

  // Nutrition targets
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;

  // Charts
  weeklyWorkoutHistory: WeeklyWorkoutStat[];
  weeklyHabitHistory: WeeklyHabitStat[];
  habitBreakdown: HabitBreakdownItem[];
  weightChartData: Array<{ weight: number }>;

  // Progress
  weightGoal: number | null;
  weightToGoal: number | null;
}

const FALLBACK: AnalyticsData = {
  weeklyScore: 0,
  workoutsThisWeek: 0,
  setsThisWeek: 0,
  avgCalories: 0,
  avgProtein: 0,
  avgCarbs: 0,
  avgFats: 0,
  dietAdherencePct: 0,
  habitCompletionPct: 0,
  currentStreak: 0,
  currentWeight: null,
  monthWeightChange: null,
  caloriesTarget: 2200,
  proteinTarget: 180,
  carbsTarget: 250,
  fatsTarget: 65,
  weeklyWorkoutHistory: [],
  weeklyHabitHistory: [],
  habitBreakdown: [],
  weightChartData: [],
  weightGoal: null,
  weightToGoal: null,
};

// ── Date helpers ──────────────────────────────────────────────────

function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Monday of the week containing a YYYY-MM-DD date
function getWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setUTCDate(d.getUTCDate() + diff);
  return m.toISOString().slice(0, 10);
}

// Sunday (end) of a week given its Monday
function getWeekSunday(monday: string): string {
  const d = new Date(monday + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

// Last N week buckets, oldest first, most recent labeled "Atual"
function buildWeekBuckets(n: number): Array<{ label: string; monday: string }> {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + diff);
  thisMonday.setHours(0, 0, 0, 0);

  return Array.from({ length: n }, (_, i) => {
    const m = new Date(thisMonday);
    m.setDate(thisMonday.getDate() - (n - 1 - i) * 7);
    return {
      label: i === n - 1 ? "Atual" : `Sem ${i + 1}`,
      monday: m.toISOString().slice(0, 10),
    };
  });
}

// ── Score ─────────────────────────────────────────────────────────

function calcScore(d: Omit<AnalyticsData, "weeklyScore">): number {
  const workoutScore  = Math.min(100, (d.workoutsThisWeek / 4) * 100);
  const nutritionScore = d.dietAdherencePct;
  const habitScore    = d.habitCompletionPct;
  const progressScore =
    d.weightToGoal !== null && d.weightToGoal > 0
      ? Math.min(100, Math.max(0, 100 - (d.weightToGoal / 5) * 100))
      : 100;
  return Math.round(
    workoutScore * 0.35 + nutritionScore * 0.25 + habitScore * 0.3 + progressScore * 0.1
  );
}

// ── Streak (consecutive days with at least one completed log) ─────

function calcStreakFromLogs(
  habitIds: string[],
  logs: Array<{ habit_id: string; date: string; completed: boolean }>
): number {
  if (habitIds.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let checkDate = today;
  for (let i = 0; i <= 365; i++) {
    const hasCompleted = logs.some(
      (l) => l.date === checkDate && l.completed && habitIds.includes(l.habit_id)
    );
    if (!hasCompleted && i > 0) break;
    if (hasCompleted) streak++;
    const d = new Date(checkDate + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    checkDate = d.toISOString().slice(0, 10);
  }
  return streak;
}

// ── Main query ────────────────────────────────────────────────────

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return FALLBACK;

    const today      = new Date().toISOString().slice(0, 10);
    const ago7       = nDaysAgo(7);
    const ago30      = nDaysAgo(30);
    const ago56      = nDaysAgo(56);
    const ago90      = nDaysAgo(90);

    const weekBuckets    = buildWeekBuckets(8);
    const thisWeekMonday = weekBuckets[7].monday;
    const thisWeekSunday = getWeekSunday(thisWeekMonday);

    // ── Parallel fetch ─────────────────────────────────────────────
    const [
      sessionsRes,
      habitsRes,
      habitLogsRes,
      mealLogsRes,
      nutritionTargetRes,
      metricsRes,
      profileRes,
    ] = await Promise.all([
      // Workout sessions: last 56 days, finished only
      supabase
        .from("workout_sessions")
        .select("id, started_at")
        .eq("user_id", user.id)
        .not("finished_at", "is", null)
        .gte("started_at", ago56 + "T00:00:00")
        .order("started_at"),

      // Habits
      supabase
        .from("habits")
        .select("id, name, icon, target_days")
        .eq("user_id", user.id)
        .eq("is_active", true),

      // Habit logs: last 56 days (filtered via habit IDs below)
      supabase
        .from("habit_logs")
        .select("habit_id, date, completed")
        .gte("date", ago56),

      // Meal logs: last 7 days
      supabase
        .from("meal_logs")
        .select("id, date")
        .eq("user_id", user.id)
        .gte("date", ago7),

      // Latest nutrition target
      supabase
        .from("nutrition_targets")
        .select("calories, protein_g, carbs_g, fats_g")
        .eq("user_id", user.id)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Body metrics: last 90 days, weight only
      supabase
        .from("body_metrics")
        .select("date, weight_kg")
        .eq("user_id", user.id)
        .gte("date", ago90)
        .not("weight_kg", "is", null)
        .order("date"),

      // Profile: target weight
      supabase
        .from("profiles")
        .select("target_weight_kg")
        .eq("id", user.id)
        .single(),
    ]);

    const sessions        = sessionsRes.data ?? [];
    const habits          = habitsRes.data ?? [];
    const habitIds        = habits.map((h) => h.id);
    // Filter habit logs to only this user's habits (no user_id column in habit_logs)
    const habitLogs       = (habitLogsRes.data ?? []).filter((l) =>
      habitIds.includes(l.habit_id)
    );
    const mealLogs        = mealLogsRes.data ?? [];
    const nutritionTarget = nutritionTargetRes.data;
    const metrics         = (metricsRes.data ?? []) as Array<{ date: string; weight_kg: number }>;
    const targetWeight    = (profileRes.data?.target_weight_kg as number | null) ?? null;

    // ── Nutrition: meal_log_items ─────────────────────────────────
    const mealLogIds = mealLogs.map((l) => l.id);
    let mealItems: Array<{
      meal_log_id: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    }> = [];
    if (mealLogIds.length > 0) {
      const { data } = await supabase
        .from("meal_log_items")
        .select("meal_log_id, calories, protein_g, carbs_g, fats_g")
        .in("meal_log_id", mealLogIds);
      mealItems = data ?? [];
    }

    // ── Workout sets this week ─────────────────────────────────────
    const thisWeekSessions = sessions.filter((s) => {
      const d = s.started_at.slice(0, 10);
      return d >= thisWeekMonday && d <= thisWeekSunday;
    });
    const workoutsThisWeek = thisWeekSessions.length;

    let setsThisWeek = 0;
    if (thisWeekSessions.length > 0) {
      const { data: seData } = await supabase
        .from("workout_session_exercises")
        .select("id")
        .in("session_id", thisWeekSessions.map((s) => s.id));

      const seIds = (seData ?? []).map((se) => se.id);
      if (seIds.length > 0) {
        const { count } = await supabase
          .from("workout_session_sets")
          .select("id", { count: "exact", head: true })
          .in("session_exercise_id", seIds)
          .eq("completed", true);
        setsThisWeek = count ?? 0;
      }
    }

    // ── Weekly workout history ────────────────────────────────────
    const weeklyWorkoutHistory: WeeklyWorkoutStat[] = weekBuckets.map(({ label, monday }) => {
      const sunday = getWeekSunday(monday);
      const count  = sessions.filter((s) => {
        const d = s.started_at.slice(0, 10);
        return d >= monday && d <= sunday;
      }).length;
      return { week: label, count, totalSets: 0 };
    });

    // ── Nutrition aggregates (last 7 days) ────────────────────────
    // Build per-day totals
    const dayTotals = new Map<
      string,
      { calories: number; protein: number; carbs: number; fats: number }
    >();
    for (const log of mealLogs) {
      if (!dayTotals.has(log.date)) {
        dayTotals.set(log.date, { calories: 0, protein: 0, carbs: 0, fats: 0 });
      }
    }
    for (const item of mealItems) {
      const log = mealLogs.find((l) => l.id === item.meal_log_id);
      if (!log) continue;
      const day = dayTotals.get(log.date)!;
      day.calories += item.calories;
      day.protein   = Math.round((day.protein + item.protein_g) * 10) / 10;
      day.carbs     = Math.round((day.carbs   + item.carbs_g)   * 10) / 10;
      day.fats      = Math.round((day.fats    + item.fats_g)    * 10) / 10;
    }
    const daysArr = [...dayTotals.values()];
    const dn      = daysArr.length || 1;
    const avgCalories = daysArr.length ? Math.round(daysArr.reduce((a, d) => a + d.calories, 0) / dn) : 0;
    const avgProtein  = daysArr.length ? Math.round(daysArr.reduce((a, d) => a + d.protein,  0) / dn * 10) / 10 : 0;
    const avgCarbs    = daysArr.length ? Math.round(daysArr.reduce((a, d) => a + d.carbs,    0) / dn * 10) / 10 : 0;
    const avgFats     = daysArr.length ? Math.round(daysArr.reduce((a, d) => a + d.fats,     0) / dn * 10) / 10 : 0;

    const targetCals     = nutritionTarget?.calories ?? 2200;
    const dietAdherencePct = avgCalories > 0
      ? Math.min(100, Math.round(
          avgCalories <= targetCals
            ? (avgCalories / targetCals) * 100
            : Math.max(0, (2 - avgCalories / targetCals)) * 100
        ))
      : 0;

    // ── Habit helpers ─────────────────────────────────────────────
    function habitApplies(targetDays: string[] | null, dateStr: string): boolean {
      if (!targetDays) return true;
      const dow = new Date(dateStr + "T12:00:00Z")
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      return targetDays.includes(dow);
    }

    function weekDays(monday: string): string[] {
      const days: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday + "T12:00:00Z");
        d.setUTCDate(d.getUTCDate() + i);
        const ds = d.toISOString().slice(0, 10);
        if (ds <= today) days.push(ds);
      }
      return days;
    }

    function weekCompletion(days: string[]): number {
      if (habits.length === 0 || days.length === 0) return 0;
      let possible = 0, completed = 0;
      for (const h of habits) {
        for (const day of days) {
          if (habitApplies(h.target_days, day)) {
            possible++;
            if (habitLogs.some((l) => l.habit_id === h.id && l.date === day && l.completed)) {
              completed++;
            }
          }
        }
      }
      return possible > 0 ? Math.round((completed / possible) * 100) : 0;
    }

    // ── Current week habit completion ─────────────────────────────
    const habitCompletionPct = weekCompletion(weekDays(thisWeekMonday));

    // ── Weekly habit history ──────────────────────────────────────
    const weeklyHabitHistory: WeeklyHabitStat[] = weekBuckets.map(({ label, monday }) => ({
      week: label,
      completionPct: weekCompletion(weekDays(monday)),
    }));

    // ── Habit breakdown (top 3 by 7-day rate) ────────────────────
    const last7Days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() - i);
      last7Days.push(d.toISOString().slice(0, 10));
    }
    const habitBreakdown: HabitBreakdownItem[] = habits
      .map((h) => {
        const applicable = last7Days.filter((day) => habitApplies(h.target_days, day));
        const done       = habitLogs.filter(
          (l) => l.habit_id === h.id && last7Days.includes(l.date) && l.completed
        ).length;
        const rate = applicable.length > 0 ? Math.round((done / applicable.length) * 100) : 0;
        return { id: h.id, name: h.name, icon: h.icon, rate };
      })
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

    // ── Current streak ────────────────────────────────────────────
    const currentStreak = calcStreakFromLogs(habitIds, habitLogs);

    // ── Weight ────────────────────────────────────────────────────
    const sortedMetrics = [...metrics].sort((a, b) => b.date.localeCompare(a.date));
    const currentWeight = sortedMetrics[0]?.weight_kg ?? null;

    let monthWeightChange: number | null = null;
    if (sortedMetrics.length >= 2 && currentWeight !== null) {
      const oldest30 = sortedMetrics.find((m) => m.date <= ago30);
      if (oldest30) {
        monthWeightChange = Math.round((currentWeight - oldest30.weight_kg) * 10) / 10;
      }
    }

    const weightToGoal =
      currentWeight !== null && targetWeight !== null
        ? Math.round((currentWeight - targetWeight) * 10) / 10
        : null;

    const weightChartData = [...metrics]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({ weight: m.weight_kg }));

    // ── Assemble & score ──────────────────────────────────────────
    const partial: Omit<AnalyticsData, "weeklyScore"> = {
      workoutsThisWeek,
      setsThisWeek,
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFats,
      dietAdherencePct,
      habitCompletionPct,
      currentStreak,
      currentWeight,
      monthWeightChange,
      caloriesTarget: nutritionTarget?.calories ?? 2200,
      proteinTarget:  nutritionTarget?.protein_g ?? 180,
      carbsTarget:    nutritionTarget?.carbs_g   ?? 250,
      fatsTarget:     nutritionTarget?.fats_g    ?? 65,
      weeklyWorkoutHistory,
      weeklyHabitHistory,
      habitBreakdown,
      weightChartData,
      weightGoal:  targetWeight,
      weightToGoal,
    };

    return { ...partial, weeklyScore: calcScore(partial) };
  } catch {
    return FALLBACK;
  }
}

