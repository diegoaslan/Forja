"use client";

import { ProgressRing } from "@/components/shared/ProgressRing";
import { MacroChip } from "./MacroChip";
import type { MacroTotals, NutritionTarget } from "@/lib/mock-nutrition";

interface NutritionHeroProps {
  totals: MacroTotals;
  target: NutritionTarget;
}

export function NutritionHero({ totals, target }: NutritionHeroProps) {
  const caloriePct = Math.min(100, Math.round((totals.calories / target.calories) * 100));
  const remaining = Math.max(0, target.calories - totals.calories);
  const over = totals.calories > target.calories;

  return (
    <div className="gradient-primary rounded-3xl p-5 text-white mx-4 mt-4">
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative shrink-0">
          <ProgressRing value={caloriePct} size={96} strokeWidth={7} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none">{totals.calories}</span>
            <span className="text-[10px] font-medium opacity-80">kcal</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold opacity-90 mb-0.5">
            {over ? "Acima da meta" : `${remaining} kcal restantes`}
          </p>
          <p className="text-xs opacity-70 mb-3">
            Meta: {target.calories} kcal
          </p>

          {/* Macro chips */}
          <div className="flex flex-wrap gap-1.5">
            <MacroChip label="P" value={Math.round(totals.protein * 10) / 10} color="protein" size="sm" />
            <MacroChip label="C" value={Math.round(totals.carbs * 10) / 10} color="carbs" size="sm" />
            <MacroChip label="G" value={Math.round(totals.fats * 10) / 10} color="fats" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
