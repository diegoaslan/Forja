"use server";

import { createClient } from "@/lib/supabase/server";

export interface GoalsData {
  weightGoalKg: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const FALLBACK_GOALS: GoalsData = {
  weightGoalKg: null,
  calories: 2200,
  protein: 180,
  carbs: 250,
  fats: 65,
};

export async function getGoals(): Promise<GoalsData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return FALLBACK_GOALS;

    const [profileRes, targetRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("target_weight_kg")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("nutrition_targets")
        .select("calories, protein_g, carbs_g, fats_g")
        .eq("user_id", user.id)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      weightGoalKg: profileRes.data?.target_weight_kg ?? null,
      calories: targetRes.data?.calories ?? 2200,
      protein: targetRes.data?.protein_g ?? 180,
      carbs: targetRes.data?.carbs_g ?? 250,
      fats: targetRes.data?.fats_g ?? 65,
    };
  } catch {
    return FALLBACK_GOALS;
  }
}

export async function updateWeightGoal(
  targetWeightKg: number
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase
      .from("profiles")
      .update({ target_weight_kg: targetWeightKg })
      .eq("id", user.id);

    return { success: !error };
  } catch {
    return { success: false };
  }
}

export async function updateNutritionTarget(data: {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { error } = await supabase.from("nutrition_targets").insert({
      user_id: user.id,
      effective_from: new Date().toISOString().slice(0, 10),
      calories: data.calories,
      protein_g: data.protein,
      carbs_g: data.carbs,
      fats_g: data.fats,
    });

    return { success: !error };
  } catch {
    return { success: false };
  }
}
