/**
 * Tipos e helpers de nutrição — usados em toda a aplicação.
 * Os dados mockados foram removidos na ETAPA 5 (substituídos pelo Supabase).
 */

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre"
  | "post";

export const MEAL_TYPE_META: Record<
  MealType,
  { label: string; icon: string; order: number }
> = {
  breakfast: { label: "Café da manhã", icon: "🌅", order: 0 },
  lunch:     { label: "Almoço",        icon: "☀️",  order: 1 },
  snack:     { label: "Lanche",        icon: "🍎",  order: 2 },
  dinner:    { label: "Jantar",        icon: "🌙",  order: 3 },
  pre:       { label: "Pré-treino",   icon: "⚡",  order: 4 },
  post:      { label: "Pós-treino",   icon: "💪",  order: 5 },
};

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  /** Valores por 100g */
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  /** Porção padrão em gramas */
  defaultServingG: number;
  /** Descrição da porção padrão ("1 unidade", "1 colher de sopa") */
  servingDesc: string;
}

export interface LoggedFood {
  id: string;
  foodItem: FoodItem;
  quantityG: number;
  /** Calculados no momento do log */
  totals: { calories: number; protein: number; carbs: number; fats: number };
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionTarget extends MacroTotals {}

export type DayMeals = Partial<Record<MealType, LoggedFood[]>>;

// ── Helpers ──────────────────────────────────────────────────────

function calcTotals(food: FoodItem, quantityG: number): MacroTotals {
  const ratio = quantityG / 100;
  return {
    calories: Math.round(food.per100g.calories * ratio),
    protein:  Math.round(food.per100g.protein  * ratio * 10) / 10,
    carbs:    Math.round(food.per100g.carbs    * ratio * 10) / 10,
    fats:     Math.round(food.per100g.fats     * ratio * 10) / 10,
  };
}

export function sumMacros(items: LoggedFood[]): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.totals.calories,
      protein:  Math.round((acc.protein  + item.totals.protein)  * 10) / 10,
      carbs:    Math.round((acc.carbs    + item.totals.carbs)    * 10) / 10,
      fats:     Math.round((acc.fats     + item.totals.fats)     * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export function sumAllMeals(meals: DayMeals): MacroTotals {
  const all = Object.values(meals).flat() as LoggedFood[];
  return sumMacros(all);
}

export function calcFoodTotals(food: FoodItem, quantityG: number): MacroTotals {
  return calcTotals(food, quantityG);
}
