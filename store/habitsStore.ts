"use client";

import { create } from "zustand";
import type { Habit, HabitLog } from "@/lib/mock-habits";

// ── Types ─────────────────────────────────────────────────────────

export interface HabitWithStats extends Habit {
  completedToday: boolean;
  streak: number;
  weeklyRate: number;
}

interface HabitsStore {
  habits: Habit[];
  logs: HabitLog[];
  today: string;
  initialized: boolean;

  // Actions
  initialize: (habits: Habit[], logs: HabitLog[]) => void;
  toggleToday: (habitId: string) => void;
  removeHabit: (habitId: string) => void;

  // Derived
  habitsWithStats: () => HabitWithStats[];
  completedTodayCount: () => number;
  totalTodayCount: () => number;
  overallStreak: () => number;
  weekGrid: () => Array<{ date: string; label: string; isToday: boolean; pct: number }>;
}

// ── Date helpers (real dates, not hardcoded) ──────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function habitAppliesToDay(habit: Habit, d: Date): boolean {
  if (habit.targetDays === "daily") return true;
  return habit.targetDays.includes(WEEKDAYS[d.getDay()]);
}

function logsForHabit(logs: HabitLog[], habitId: string): HabitLog[] {
  return logs.filter((l) => l.habitId === habitId);
}

function calcStreak(logs: HabitLog[], habit: Habit, today: string): number {
  let streak = 0;
  const checkDate = new Date(today);

  for (let i = 0; i < 90; i++) {
    if (habitAppliesToDay(habit, checkDate)) {
      const dateS = checkDate.toISOString().slice(0, 10);
      const log = logsForHabit(logs, habit.id).find((l) => l.date === dateS);
      if (!log?.completed) break;
      streak++;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

function completionRate(logs: HabitLog[], habitId: string, days: number, today: string): number {
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - days + 1);
  const cutoff = cutoffDate.toISOString().slice(0, 10);

  const relevant = logs.filter((l) => l.habitId === habitId && l.date >= cutoff);
  if (!relevant.length) return 0;
  const done = relevant.filter((l) => l.completed).length;
  return Math.round((done / relevant.length) * 100);
}

function last7Days(today: string): Array<{ date: string; label: string; isToday: boolean }> {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return {
      date: dateStr,
      label: DAY_LABELS[d.getDay()],
      isToday: dateStr === today,
    };
  });
}

// ── Store ─────────────────────────────────────────────────────────

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  logs: [],
  today: todayISO(),
  initialized: false,

  initialize: (habits, logs) =>
    set({ habits, logs, today: todayISO(), initialized: true }),

  habitsWithStats: () => {
    const { habits, logs, today } = get();
    return habits.map((habit) => ({
      ...habit,
      completedToday:
        logsForHabit(logs, habit.id).find((l) => l.date === today)?.completed ?? false,
      streak: calcStreak(logs, habit, today),
      weeklyRate: completionRate(logs, habit.id, 7, today),
    }));
  },

  completedTodayCount: () => {
    const { habits, logs, today } = get();
    const todayDate = new Date(today);
    return habits.filter(
      (h) =>
        habitAppliesToDay(h, todayDate) &&
        logsForHabit(logs, h.id).find((l) => l.date === today && l.completed)
    ).length;
  },

  totalTodayCount: () => {
    const { habits, today } = get();
    const todayDate = new Date(today);
    return habits.filter((h) => habitAppliesToDay(h, todayDate)).length;
  },

  overallStreak: () => {
    const { habits, logs } = get();
    let streak = 0;
    const checkDate = new Date();

    for (let i = 0; i < 90; i++) {
      const dateS = checkDate.toISOString().slice(0, 10);
      const dayHabits = habits.filter((h) => habitAppliesToDay(h, checkDate));

      if (dayHabits.length > 0) {
        const allDone = dayHabits.every((h) =>
          logsForHabit(logs, h.id).find((l) => l.date === dateS && l.completed)
        );
        if (!allDone) break;
        streak++;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  },

  weekGrid: () => {
    const { habits, logs, today } = get();
    return last7Days(today).map(({ date, label, isToday }) => {
      const d = new Date(date);
      const dayHabits = habits.filter((h) => habitAppliesToDay(h, d));
      if (!dayHabits.length) return { date, label, isToday, pct: 0 };

      const done = dayHabits.filter((h) =>
        logsForHabit(logs, h.id).find((l) => l.date === date && l.completed)
      ).length;

      return { date, label, isToday, pct: Math.round((done / dayHabits.length) * 100) };
    });
  },

  toggleToday: (habitId) => {
    set((state) => {
      const { today, logs } = state;
      const idx = logs.findIndex((l) => l.habitId === habitId && l.date === today);

      const newLogs =
        idx >= 0
          ? logs.map((l, i) => (i === idx ? { ...l, completed: !l.completed } : l))
          : [...logs, { habitId, date: today, completed: true }];

      return { logs: newLogs };
    });
  },

  removeHabit: (habitId) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== habitId),
      logs: state.logs.filter((l) => l.habitId !== habitId),
    }));
  },
}));
