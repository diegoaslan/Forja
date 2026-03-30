"use server";

import { createClient } from "@/lib/supabase/server";
import type { MealType, FoodItem, LoggedFood, DayMeals, NutritionTarget } from "@/lib/mock-nutrition";
import type { MockNutrition } from "@/lib/mock-data";

// ── DB → domain adapters ──────────────────────────────────────────

type DbFoodItem = {
  id: string;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  default_serving_g: number | null;
  serving_desc: string | null;
};

function dbFoodToLocal(row: DbFoodItem): FoodItem {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? undefined,
    per100g: {
      calories: row.calories_per_100g,
      protein:  row.protein_per_100g,
      carbs:    row.carbs_per_100g,
      fats:     row.fats_per_100g,
    },
    defaultServingG: row.default_serving_g ?? 100,
    servingDesc:     row.serving_desc ?? "100g",
  };
}

function calcSnapshotMacros(food: DbFoodItem, quantityG: number) {
  const r = quantityG / 100;
  return {
    calories:  Math.round(food.calories_per_100g * r),
    protein_g: Math.round(food.protein_per_100g  * r * 10) / 10,
    carbs_g:   Math.round(food.carbs_per_100g    * r * 10) / 10,
    fats_g:    Math.round(food.fats_per_100g     * r * 10) / 10,
  };
}

// ── Initial data bundle ───────────────────────────────────────────

export interface InitialNutritionData {
  meals: DayMeals;
  target: NutritionTarget;
  foodItems: FoodItem[];
}

const FALLBACK_TARGET: NutritionTarget = {
  calories: 2200,
  protein: 180,
  carbs: 250,
  fats: 65,
};

// ── Queries ───────────────────────────────────────────────────────

/**
 * Fetches everything the /nutrition page needs for today.
 * Uses 4 separate queries to avoid nested-select type inference issues.
 */
export async function getNutritionDayData(): Promise<InitialNutritionData> {
  const FALLBACK: InitialNutritionData = {
    meals: {},
    target: FALLBACK_TARGET,
    foodItems: [],
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return FALLBACK;

    const today = new Date().toISOString().slice(0, 10);

    // ── Run independent queries in parallel ───────────────────────
    const [logsRes, targetRes, allFoodsRes] = await Promise.all([
      // Today's meal_logs (just id + meal_type)
      supabase
        .from("meal_logs")
        .select("id, meal_type")
        .eq("user_id", user.id)
        .eq("date", today),

      // Latest nutrition target
      supabase
        .from("nutrition_targets")
        .select("calories, protein_g, carbs_g, fats_g")
        .eq("user_id", user.id)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle(),

      // All food items (global + user-created) for the picker
      supabase
        .from("food_items")
        .select(
          "id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, default_serving_g, serving_desc"
        )
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order("name"),
    ]);

    const mealLogs = logsRes.data ?? [];

    // ── Fetch meal_log_items for today's logs ─────────────────────
    let logItems: Array<{
      id: string;
      meal_log_id: string;
      food_item_id: string;
      quantity_g: number;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    }> = [];

    if (mealLogs.length > 0) {
      const mealLogIds = mealLogs.map((l) => l.id);
      const { data: itemsData } = await supabase
        .from("meal_log_items")
        .select("id, meal_log_id, food_item_id, quantity_g, calories, protein_g, carbs_g, fats_g")
        .in("meal_log_id", mealLogIds);
      logItems = itemsData ?? [];
    }

    // ── Fetch food items used in today's logs (for display info) ──
    const usedFoodIds = [...new Set(logItems.map((i) => i.food_item_id))];
    let logFoodsMap: Map<string, DbFoodItem> = new Map();

    if (usedFoodIds.length > 0) {
      const { data: logFoodsData } = await supabase
        .from("food_items")
        .select(
          "id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, default_serving_g, serving_desc"
        )
        .in("id", usedFoodIds);

      for (const f of logFoodsData ?? []) {
        logFoodsMap.set(f.id, f as DbFoodItem);
      }
    }

    // ── Build DayMeals ────────────────────────────────────────────
    const meals: DayMeals = {};
    for (const log of mealLogs) {
      const mealType = log.meal_type as MealType;
      const items: LoggedFood[] = [];

      for (const item of logItems.filter((i) => i.meal_log_id === log.id)) {
        const food = logFoodsMap.get(item.food_item_id);
        if (!food) continue;

        items.push({
          id: item.id,
          foodItem: dbFoodToLocal(food),
          quantityG: item.quantity_g,
          totals: {
            calories: item.calories,    // snapshot ← approved design decision
            protein:  item.protein_g,
            carbs:    item.carbs_g,
            fats:     item.fats_g,
          },
        });
      }

      meals[mealType] = items;
    }

    // ── Target ────────────────────────────────────────────────────
    const target: NutritionTarget = targetRes.data
      ? {
          calories: targetRes.data.calories,
          protein:  targetRes.data.protein_g,
          carbs:    targetRes.data.carbs_g,
          fats:     targetRes.data.fats_g,
        }
      : FALLBACK_TARGET;

    // ── Food items for picker ─────────────────────────────────────
    const foodItems = (allFoodsRes.data ?? []).map((f) => dbFoodToLocal(f as DbFoodItem));

    return { meals, target, foodItems };
  } catch {
    return { meals: {}, target: FALLBACK_TARGET, foodItems: [] };
  }
}

/**
 * Light query for the Home page NutritionSummaryCard.
 * Returns today's consumed macros vs target, or null if no data.
 */
export async function getNutritionSummary(): Promise<MockNutrition | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().slice(0, 10);

    // 1. Today's meal_log IDs
    const { data: logsData } = await supabase
      .from("meal_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today);

    // 2. Latest nutrition target
    const { data: targetData } = await supabase
      .from("nutrition_targets")
      .select("calories, protein_g, carbs_g, fats_g")
      .eq("user_id", user.id)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Items for those logs (snapshot macros only)
    let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    const logIds = (logsData ?? []).map((l) => l.id);

    if (logIds.length > 0) {
      const { data: items } = await supabase
        .from("meal_log_items")
        .select("calories, protein_g, carbs_g, fats_g")
        .in("meal_log_id", logIds);

      for (const item of items ?? []) {
        totalCals    += item.calories;
        totalProtein  = Math.round((totalProtein + item.protein_g) * 10) / 10;
        totalCarbs    = Math.round((totalCarbs   + item.carbs_g)   * 10) / 10;
        totalFats     = Math.round((totalFats    + item.fats_g)    * 10) / 10;
      }
    }

    if (!logIds.length && !targetData) return null;

    const target = targetData ?? { calories: 2200, protein_g: 180, carbs_g: 250, fats_g: 65 };

    return {
      calories: { current: totalCals, target: target.calories },
      macros: [
        { label: "Proteína",    current: totalProtein, target: target.protein_g, unit: "g", color: "bg-blue-500"  },
        { label: "Carboidrato", current: totalCarbs,   target: target.carbs_g,   unit: "g", color: "bg-amber-500" },
        { label: "Gordura",     current: totalFats,    target: target.fats_g,    unit: "g", color: "bg-rose-500"  },
      ],
    };
  } catch {
    return null;
  }
}

// ── Mutations ─────────────────────────────────────────────────────

/**
 * Adds a food item to a meal for today.
 * - Upserts the meal_log (get-or-create)
 * - Inserts the meal_log_item with snapshot macros at log time
 */
export async function addFoodToMeal(
  mealType: MealType,
  foodItemId: string,
  quantityG: number
): Promise<LoggedFood | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().slice(0, 10);

    // 1. Get or create meal_log
    const { data: mealLog, error: mlErr } = await supabase
      .from("meal_logs")
      .upsert(
        { user_id: user.id, date: today, meal_type: mealType },
        { onConflict: "user_id,date,meal_type" }
      )
      .select("id")
      .single();

    if (mlErr || !mealLog) return null;

    // 2. Fetch food to compute snapshot macros
    const { data: food, error: foodErr } = await supabase
      .from("food_items")
      .select(
        "id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, default_serving_g, serving_desc"
      )
      .eq("id", foodItemId)
      .single();

    if (foodErr || !food) return null;

    // 3. Compute & store snapshot macros (approved design decision)
    const snap = calcSnapshotMacros(food as DbFoodItem, quantityG);

    const { data: item, error: itemErr } = await supabase
      .from("meal_log_items")
      .insert({
        meal_log_id:  mealLog.id,
        food_item_id: foodItemId,
        quantity_g:   quantityG,
        calories:     snap.calories,
        protein_g:    snap.protein_g,
        carbs_g:      snap.carbs_g,
        fats_g:       snap.fats_g,
      })
      .select("id, quantity_g, calories, protein_g, carbs_g, fats_g")
      .single();

    if (itemErr || !item) return null;

    return {
      id:        item.id,
      foodItem:  dbFoodToLocal(food as DbFoodItem),
      quantityG: item.quantity_g,
      totals: {
        calories: item.calories,
        protein:  item.protein_g,
        carbs:    item.carbs_g,
        fats:     item.fats_g,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Creates a custom food item for the authenticated user.
 * Returns the full FoodItem on success (so it can be added to the store immediately).
 */
export async function createFoodItem(data: {
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  defaultServingG: number;
  servingDesc: string;
}): Promise<FoodItem | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: inserted, error } = await supabase
      .from("food_items")
      .insert({
        user_id: user.id,
        name: data.name.trim(),
        brand: data.brand?.trim() || null,
        calories_per_100g: data.caloriesPer100g,
        protein_per_100g: data.proteinPer100g,
        carbs_per_100g: data.carbsPer100g,
        fats_per_100g: data.fatsPer100g,
        default_serving_g: data.defaultServingG,
        serving_desc: data.servingDesc.trim() || "100g",
      })
      .select(
        "id, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, default_serving_g, serving_desc"
      )
      .single();

    if (error || !inserted) return null;
    return dbFoodToLocal(inserted as DbFoodItem);
  } catch {
    return null;
  }
}

/**
 * Deletes a meal_log_item by id.
 * Silently fails — the optimistic update in the store handles the session state.
 */
export async function removeFoodFromMeal(mealLogItemId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("meal_log_items").delete().eq("id", mealLogItemId);
  } catch {
    // Intentionally silent
  }
}
