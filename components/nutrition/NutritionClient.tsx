"use client";

import { useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { NutritionHero } from "./NutritionHero";
import { MacroProgressCard } from "./MacroProgressCard";
import { MealSection } from "./MealSection";
import { AddFoodSheet } from "./AddFoodSheet";
import { NutritionSkeleton } from "./NutritionSkeleton";
import { MEAL_TYPE_META } from "@/lib/mock-nutrition";
import type { MealType } from "@/lib/mock-nutrition";
import { useNutritionStore } from "@/store/nutritionStore";
import { removeFoodFromMeal } from "@/lib/actions/nutrition";
import type { InitialNutritionData } from "@/lib/actions/nutrition";

// ── Props ─────────────────────────────────────────────────────────

interface NutritionClientProps {
  initialData: InitialNutritionData;
}

// ── Meal order (stable, derived from metadata) ────────────────────

const MEAL_ORDER = (
  Object.entries(MEAL_TYPE_META) as [MealType, (typeof MEAL_TYPE_META)[MealType]][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key]) => key);

// ── Component ─────────────────────────────────────────────────────

export function NutritionClient({ initialData }: NutritionClientProps) {
  const store = useNutritionStore();

  // Initialize store from server-fetched data (once on mount)
  useEffect(() => {
    store.initialize(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { meals, dailyTotals, target, openSheet, initialized } = store;

  /**
   * Optimistic remove: update store immediately, then persist deletion.
   */
  const handleRemove = useCallback(
    (meal: MealType, logId: string) => {
      store.onFoodRemoved(meal, logId);
      removeFoodFromMeal(logId).catch(() => {
        // Silent — item already removed from UI
      });
    },
    [store]
  );

  if (!initialized) return <NutritionSkeleton />;

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto md:max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight">Nutrição</h1>
          <button
            type="button"
            onClick={() => openSheet()}
            className="flex items-center gap-1.5 rounded-xl px-3 h-9 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="space-y-3 pb-24 md:pb-8 max-w-lg mx-auto md:max-w-2xl">
        {/* Calorie ring */}
        <NutritionHero totals={dailyTotals} target={target} />

        {/* Macro progress bars */}
        <MacroProgressCard totals={dailyTotals} target={target} />

        {/* Meal sections */}
        <div className="space-y-3 pt-1">
          <h2 className="px-4 text-base font-semibold">Refeições</h2>
          {MEAL_ORDER.map((meal) => (
            <MealSection
              key={meal}
              meal={meal}
              items={meals[meal] ?? []}
              onRemove={(logId) => handleRemove(meal, logId)}
              onAdd={() => openSheet(meal)}
              defaultOpen={meal === "breakfast" || meal === "lunch" || meal === "snack"}
            />
          ))}
        </div>
      </div>

      {/* Add-food bottom sheet */}
      <AddFoodSheet />
    </>
  );
}
