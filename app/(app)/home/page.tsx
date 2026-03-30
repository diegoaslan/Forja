import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getHabitsSummary } from "@/lib/actions/habits";
import { getWeightSummary } from "@/lib/actions/progress";
import { getNutritionSummary } from "@/lib/actions/nutrition";
import { getWorkoutSummary } from "@/lib/actions/workouts";
import {
  MOCK_NUTRITION,
  MOCK_WEIGHT,
} from "@/lib/mock-data";

import { DailyProgressCard } from "@/components/home/DailyProgressCard";
import { DailyChecklist } from "@/components/home/DailyChecklist";
import { QuickActions } from "@/components/home/QuickActions";
import { WorkoutSummaryCard } from "@/components/home/WorkoutSummaryCard";
import { NutritionSummaryCard } from "@/components/home/NutritionSummaryCard";
import { StreakWidget } from "@/components/home/StreakWidget";
import { WeightWidget } from "@/components/home/WeightWidget";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  // User identity — real from Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Atleta";
  const firstName = fullName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Weight summary — real from Supabase (falls back to mock if user has no records yet)
  const weightData = await getWeightSummary();
  const weightWidget = weightData
    ? { current: weightData.current, previous: weightData.previous, goal: weightData.goal, unit: "kg" as const }
    : MOCK_WEIGHT;

  // Habits summary — real from Supabase (falls back to zeros if user has no habits yet)
  const {
    currentStreak,
    weeklyDone,
    completedToday: habitsDoneToday,
    totalToday: habitsTotalToday,
    todayHabits,
    completedTodayIds,
  } = await getHabitsSummary();

  // Nutrition summary — real from Supabase (falls back to mock if user has no data yet)
  const nutritionData = await getNutritionSummary();
  const nutritionWidget = nutritionData ?? MOCK_NUTRITION;

  // Workout summary — real from Supabase (null if no session today)
  const workoutWidget = await getWorkoutSummary();

  const doneTasks = habitsDoneToday;
  const totalTasks = habitsTotalToday;

  const realStreak = {
    current: currentStreak,
    best: currentStreak, // best streak requires full history — deferred to ETAPA 4.6
    weeklyDone,
  };

  return (
    <div className="px-4 py-5 space-y-5 max-w-lg mx-auto md:max-w-none md:py-8">
      {/* ── Saudação ──────────────────────────────────────────────── */}
      <div className="space-y-0.5 md:max-w-2xl md:mx-auto">
        <p className="text-sm text-muted-foreground capitalize">{today}</p>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
      </div>

      {/*
       * Layout Desktop: 2 colunas lado a lado
       * - Esquerda: checklist + streak + peso
       * - Direita:  progresso + treino + nutrição
       *
       * Mobile: coluna única, mesma ordem
       */}
      <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-6 md:items-start md:max-w-4xl md:mx-auto">

        {/* ── COLUNA ESQUERDA (mobile: aparece primeiro) ────────────── */}
        <div className="space-y-5">
          {/* Hero: progresso do dia (real quando há hábitos, mock caso contrário) */}
          <DailyProgressCard
            done={doneTasks}
            total={totalTasks}
            streakDays={currentStreak}
          />

          {/* Checklist interativo — real habits from Supabase */}
          <DailyChecklist
            items={todayHabits}
            initialCompleted={completedTodayIds}
          />
        </div>

        {/* ── COLUNA DIREITA ─────────────────────────────────────────── */}
        <div className="space-y-5 mt-5 md:mt-0">
          {/* Ações rápidas */}
          <QuickActions />

          {/* Resumo do treino — real quando há sessão hoje, null caso contrário */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Treino de hoje</h2>
            <WorkoutSummaryCard workout={workoutWidget} />
          </div>

          {/* Resumo nutricional — real quando há dados, mock caso contrário */}
          <NutritionSummaryCard nutrition={nutritionWidget} />

          {/* Streak (real) + Peso (ainda mock — ETAPA 4.3) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StreakWidget streak={realStreak} />
            <WeightWidget weight={weightWidget} />
          </div>
        </div>
      </div>
    </div>
  );
}
