"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { updateWeightGoal, updateNutritionTarget } from "@/lib/actions/settings";
import type { GoalsData } from "@/lib/actions/settings";

interface GoalsFormProps {
  initial: GoalsData;
}

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <Check className="h-4 w-4" />
      ) : null}
      {loading ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
    </button>
  );
}

function NumericInput({
  label, value, onChange, min = 0, step = 1, unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-sm font-semibold outline-none tabular-nums"
        />
        {unit && <span className="text-xs text-muted-foreground shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

export function GoalsForm({ initial }: GoalsFormProps) {
  const router = useRouter();

  // Weight goal state
  const [weightGoal, setWeightGoal] = useState(initial.weightGoalKg ?? 70);
  const [weightLoading, setWeightLoading] = useState(false);
  const [weightSaved, setWeightSaved] = useState(false);

  // Nutrition targets state
  const [calories, setCalories] = useState(initial.calories);
  const [protein, setProtein] = useState(initial.protein);
  const [carbs, setCarbs] = useState(initial.carbs);
  const [fats, setFats] = useState(initial.fats);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionSaved, setNutritionSaved] = useState(false);

  async function handleWeightSave(e: React.FormEvent) {
    e.preventDefault();
    if (weightLoading) return;
    setWeightLoading(true);
    const result = await updateWeightGoal(weightGoal);
    setWeightLoading(false);
    if (result.success) {
      setWeightSaved(true);
      router.refresh();
      setTimeout(() => setWeightSaved(false), 2000);
    }
  }

  async function handleNutritionSave(e: React.FormEvent) {
    e.preventDefault();
    if (nutritionLoading) return;
    setNutritionLoading(true);
    const result = await updateNutritionTarget({ calories, protein, carbs, fats });
    setNutritionLoading(false);
    if (result.success) {
      setNutritionSaved(true);
      router.refresh();
      setTimeout(() => setNutritionSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-5 px-4 pb-8">
      {/* Weight goal card */}
      <form onSubmit={handleWeightSave} className="rounded-2xl bg-card card-shadow overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Meta de peso
          </p>
          {initial.weightGoalKg !== null && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Meta atual: {initial.weightGoalKg} kg
            </p>
          )}
        </div>
        <div className="p-4 space-y-4">
          <NumericInput
            label="Peso alvo (kg)"
            value={weightGoal}
            onChange={setWeightGoal}
            min={30}
            step={0.5}
            unit="kg"
          />
          <SaveButton loading={weightLoading} saved={weightSaved} />
        </div>
      </form>

      {/* Nutrition targets card */}
      <form onSubmit={handleNutritionSave} className="rounded-2xl bg-card card-shadow overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Metas nutricionais diárias
          </p>
        </div>
        <div className="p-4 space-y-4">
          <NumericInput
            label="Calorias"
            value={calories}
            onChange={setCalories}
            min={500}
            step={50}
            unit="kcal"
          />
          <NumericInput
            label="Proteína"
            value={protein}
            onChange={setProtein}
            min={0}
            step={5}
            unit="g"
          />
          <NumericInput
            label="Carboidratos"
            value={carbs}
            onChange={setCarbs}
            min={0}
            step={5}
            unit="g"
          />
          <NumericInput
            label="Gorduras"
            value={fats}
            onChange={setFats}
            min={0}
            step={5}
            unit="g"
          />

          {/* Live summary */}
          <div className="rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{calories} kcal</span>
            {" · "}P {protein}g · C {carbs}g · G {fats}g
          </div>

          <SaveButton loading={nutritionLoading} saved={nutritionSaved} />
        </div>
      </form>
    </div>
  );
}
