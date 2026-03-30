"use client";

import { Trash2 } from "lucide-react";
import { MacroChip } from "./MacroChip";
import type { LoggedFood } from "@/lib/mock-nutrition";

interface FoodItemRowProps {
  item: LoggedFood;
  onRemove: (id: string) => void;
}

export function FoodItemRow({ item, onRemove }: FoodItemRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Food info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.foodItem.name}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground">{item.quantityG}g</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-semibold">{item.totals.calories} kcal</span>
          <MacroChip label="P" value={Math.round(item.totals.protein * 10) / 10} color="protein" size="sm" />
          <MacroChip label="C" value={Math.round(item.totals.carbs * 10) / 10} color="carbs" size="sm" />
          <MacroChip label="G" value={Math.round(item.totals.fats * 10) / 10} color="fats" size="sm" />
        </div>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
        aria-label="Remover alimento"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
