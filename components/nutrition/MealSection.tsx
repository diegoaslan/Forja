"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FoodItemRow } from "./FoodItemRow";
import { sumMacros } from "@/lib/mock-nutrition";
import type { MealType, LoggedFood } from "@/lib/mock-nutrition";
import { MEAL_TYPE_META } from "@/lib/mock-nutrition";

interface MealSectionProps {
  meal: MealType;
  items: LoggedFood[];
  onRemove: (logId: string) => void;
  onAdd: () => void;
  defaultOpen?: boolean;
}

export function MealSection({ meal, items, onRemove, onAdd, defaultOpen = true }: MealSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = MEAL_TYPE_META[meal];
  const totals = sumMacros(items);
  const hasItems = items.length > 0;

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="text-xl leading-none">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{meta.label}</p>
          {hasItems && (
            <p className="text-xs text-muted-foreground">
              {totals.calories} kcal · {items.length} item{items.length > 1 ? "s" : ""}
            </p>
          )}
          {!hasItems && (
            <p className="text-xs text-muted-foreground">Vazio</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Items */}
      {open && (
        <>
          {hasItems && (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <FoodItemRow key={item.id} item={item} onRemove={onRemove} />
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-border"
          >
            <Plus className="h-4 w-4" />
            Adicionar alimento
          </button>
        </>
      )}
    </div>
  );
}
