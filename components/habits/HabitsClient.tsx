"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useHabitsStore } from "@/store/habitsStore";
import { toggleHabitLog, deleteHabit } from "@/lib/actions/habits";
import { HabitStreakCard } from "./HabitStreakCard";
import { WeeklyConsistency } from "./WeeklyConsistency";
import { HabitToggleRow } from "./HabitToggleRow";
import { HabitsEmptyState } from "./HabitsEmptyState";
import { HabitsSkeleton } from "./HabitsSkeleton";
import { CreateHabitButton } from "./CreateHabitSheet";
import type { Habit, HabitLog } from "@/lib/mock-habits";

interface HabitsClientProps {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
}

export function HabitsClient({ initialHabits, initialLogs }: HabitsClientProps) {
  const store = useHabitsStore();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);

  // Re-initialize when the habit list changes (after create/delete via router.refresh())
  const habitKey = initialHabits.map((h) => h.id).join(",");
  useEffect(() => {
    store.initialize(initialHabits, initialLogs);
    setEditMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitKey]);

  const habits = store.habitsWithStats();
  const completed = store.completedTodayCount();
  const total = store.totalTodayCount();
  const overallStreak = store.overallStreak();
  const weekGrid = store.weekGrid();

  const handleToggle = useCallback(
    async (habitId: string) => {
      // Snapshot antes da atualização optimista para permitir rollback
      const prevLogs = useHabitsStore.getState().logs;
      store.toggleToday(habitId);
      const { logs, today } = useHabitsStore.getState();
      const log = logs.find((l) => l.habitId === habitId && l.date === today);
      try {
        await toggleHabitLog(habitId, today, log?.completed ?? true);
      } catch (err) {
        console.error("[HabitsClient] rollback toggle — falha ao salvar hábito:", err);
        // Reverte o estado optimista para o valor anterior
        useHabitsStore.setState({ logs: prevLogs });
      }
    },
    [store]
  );

  const handleDelete = useCallback(
    (habitId: string) => {
      store.removeHabit(habitId); // optimistic
      deleteHabit(habitId).catch(() => {});
      router.refresh();
    },
    [store, router]
  );

  if (!store.initialized) return <HabitsSkeleton />;

  if (initialHabits.length === 0) {
    return (
      <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-screen">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto md:max-w-2xl">
            <h1 className="text-xl font-bold tracking-tight">Hábitos</h1>
            <CreateHabitButton />
          </div>
        </header>
        <HabitsEmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-screen">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto md:max-w-2xl gap-3">
          <h1 className="text-xl font-bold tracking-tight">Hábitos</h1>
          <div className="flex items-center gap-2 ml-auto">
            {editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
              >
                Concluir
              </button>
            ) : (
              <>
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <span className="text-xs font-semibold text-primary">{completed}</span>
                  <span className="text-xs text-muted-foreground">/{total} hoje</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/70 transition-colors"
                  aria-label="Gerenciar hábitos"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <CreateHabitButton />
              </>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-3 pb-24 md:pb-8 max-w-lg mx-auto md:max-w-2xl w-full">
        <HabitStreakCard completed={completed} total={total} overallStreak={overallStreak} />
        <WeeklyConsistency days={weekGrid} />

        <div className="mx-4 space-y-1.5">
          <h2 className="text-base font-semibold">
            {editMode ? "Toque no lixo para remover" : "Hoje"}
          </h2>
          <div className="rounded-2xl bg-card card-shadow overflow-hidden divide-y divide-border">
            {habits.map((habit) => (
              editMode ? (
                <div key={habit.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-xl">
                    {habit.icon}
                  </div>
                  <span className="flex-1 text-sm font-semibold">{habit.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(habit.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                    aria-label={`Remover ${habit.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ) : (
                <HabitToggleRow key={habit.id} habit={habit} onToggle={handleToggle} />
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
