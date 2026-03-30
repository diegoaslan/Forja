"use client";

import { create } from "zustand";
import {
  calcFoodTotals,
  sumAllMeals,
  type DayMeals,
  type FoodItem,
  type LoggedFood,
  type MealType,
  type MacroTotals,
  type NutritionTarget,
} from "@/lib/mock-nutrition";
import type { InitialNutritionData } from "@/lib/actions/nutrition";

// ── Add-food sheet state machine ──────────────────────────────────

export type AddSheetStep = "meal" | "food" | "quantity" | "create_food";

interface AddFoodDraft {
  meal: MealType | null;
  food: FoodItem | null;
  quantityG: number;
}

const INITIAL_DRAFT: AddFoodDraft = { meal: null, food: null, quantityG: 100 };

// ── Store ─────────────────────────────────────────────────────────

interface NutritionStore {
  // Data
  meals: DayMeals;
  target: NutritionTarget;
  foodItems: FoodItem[];  // source for the food picker (replaces FOOD_DATABASE)
  dailyTotals: MacroTotals;
  initialized: boolean;

  // Add-food sheet
  sheetOpen: boolean;
  sheetStep: AddSheetStep;
  draft: AddFoodDraft;
  foodSearch: string;
  saving: boolean;

  // Init
  initialize: (data: InitialNutritionData) => void;

  // Optimistic data updates (called after server actions succeed)
  onFoodAdded: (meal: MealType, food: LoggedFood) => void;
  onFoodRemoved: (meal: MealType, logId: string) => void;
  onFoodItemCreated: (food: FoodItem) => void;

  // Sheet actions (UI state only — no server calls)
  openSheet: (meal?: MealType) => void;
  closeSheet: () => void;
  setSheetStep: (step: AddSheetStep) => void;
  selectMeal: (meal: MealType) => void;
  selectFood: (food: FoodItem) => void;
  setQuantity: (g: number) => void;
  setFoodSearch: (q: string) => void;
  setSaving: (saving: boolean) => void;

  // Navigate to create-food step (from food search)
  goToCreateFood: () => void;
}

// ── Create store ──────────────────────────────────────────────────

export const useNutritionStore = create<NutritionStore>((set, get) => ({
  meals: {},
  target: { calories: 2200, protein: 180, carbs: 250, fats: 65 },
  foodItems: [],
  dailyTotals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
  initialized: false,

  sheetOpen: false,
  sheetStep: "meal",
  draft: INITIAL_DRAFT,
  foodSearch: "",
  saving: false,

  initialize: (data) =>
    set({
      meals:       data.meals,
      target:      data.target,
      foodItems:   data.foodItems,
      dailyTotals: sumAllMeals(data.meals),
      initialized: true,
    }),

  onFoodAdded: (meal, food) => {
    set((state) => {
      const updated: DayMeals = {
        ...state.meals,
        [meal]: [...(state.meals[meal] ?? []), food],
      };
      return { meals: updated, dailyTotals: sumAllMeals(updated) };
    });
  },

  onFoodRemoved: (meal, logId) => {
    set((state) => {
      const updated: DayMeals = {
        ...state.meals,
        [meal]: (state.meals[meal] ?? []).filter((l) => l.id !== logId),
      };
      return { meals: updated, dailyTotals: sumAllMeals(updated) };
    });
  },

  openSheet: (meal) => {
    set({
      sheetOpen: true,
      sheetStep: meal ? "food" : "meal",
      draft: meal ? { meal, food: null, quantityG: 100 } : INITIAL_DRAFT,
      foodSearch: "",
    });
  },

  closeSheet: () =>
    set({
      sheetOpen: false,
      sheetStep: "meal",
      draft: INITIAL_DRAFT,
      foodSearch: "",
      saving: false,
    }),

  setSheetStep: (step) => set({ sheetStep: step }),

  selectMeal: (meal) =>
    set({ draft: { meal, food: null, quantityG: 100 }, sheetStep: "food", foodSearch: "" }),

  selectFood: (food) =>
    set((state) => ({
      draft: { ...state.draft, food, quantityG: food.defaultServingG },
      sheetStep: "quantity",
    })),

  setQuantity: (g) =>
    set((state) => ({ draft: { ...state.draft, quantityG: Math.max(1, g) } })),

  setFoodSearch: (q) => set({ foodSearch: q }),

  setSaving: (saving) => set({ saving }),

  onFoodItemCreated: (food) => {
    set((state) => ({
      foodItems: [...state.foodItems, food].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },

  goToCreateFood: () => set({ sheetStep: "create_food" }),
}));

// ── Food list selector ────────────────────────────────────────────

/**
 * Filters the store's food items by name/brand.
 * Pass foodItems from store state to keep results reactive.
 */
export function filteredFoods(foodItems: FoodItem[], search: string): FoodItem[] {
  if (!search.trim()) return foodItems;
  const q = search.toLowerCase().trim();
  return foodItems.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.brand ?? "").toLowerCase().includes(q)
  );
}

// Re-export calcFoodTotals for AddFoodSheet (no mock import needed there)
export { calcFoodTotals };
