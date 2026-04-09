"use client";

import { useCallback, useState } from "react";
import { Search, ChevronLeft, Check, Loader2, Plus } from "lucide-react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { MacroChip } from "./MacroChip";
import { MEAL_TYPE_META } from "@/lib/mock-nutrition";
import type { MealType, FoodItem } from "@/lib/mock-nutrition";
import { useNutritionStore, filteredFoods, calcFoodTotals } from "@/store/nutritionStore";
import type { AddSheetStep } from "@/store/nutritionStore";
import { addFoodToMeal, createFoodItem } from "@/lib/actions/nutrition";

// ── Step: select meal ─────────────────────────────────────────────

function StepMeal({ onSelect }: { onSelect: (m: MealType) => void }) {
  const meals = Object.entries(MEAL_TYPE_META) as [MealType, (typeof MEAL_TYPE_META)[MealType]][];
  const sorted = meals.sort((a, b) => a[1].order - b[1].order);

  return (
    <div className="px-4 pb-4 space-y-2 pt-2">
      <p className="text-xs text-muted-foreground mb-3">Selecione a refeição</p>
      {sorted.map(([key, meta]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className="flex items-center gap-3 w-full rounded-2xl p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
        >
          <span className="text-2xl leading-none">{meta.icon}</span>
          <span className="text-sm font-medium">{meta.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Step: select food ─────────────────────────────────────────────

function StepFood({
  foodItems,
  onSelect,
  search,
  onSearch,
  onCreateFood,
}: {
  foodItems: FoodItem[];
  onSelect: (f: FoodItem) => void;
  search: string;
  onSearch: (q: string) => void;
  onCreateFood: () => void;
}) {
  const foods = filteredFoods(foodItems, search);

  // Sem scroll próprio: o BottomSheet já tem overflow-y-auto no container de conteúdo.
  // A barra de busca usa sticky para ficar visível ao rolar a lista.
  return (
    <div>
      {/* Search bar — sticky no topo do scroll container do BottomSheet */}
      <div className="sticky top-0 z-10 bg-card px-4 pb-3 pt-1">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 h-10">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Buscar alimento..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
      </div>

      {/* Lista — flui normalmente no scroll do BottomSheet */}
      <div className="divide-y divide-border">
        {foods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 px-4">
            Nenhum alimento encontrado
            {search.trim() ? ` para "${search}"` : ""}
          </p>
        )}
        {foods.map((food) => {
          const preview = calcFoodTotals(food, food.defaultServingG);
          return (
            <button
              key={food.id}
              type="button"
              onClick={() => onSelect(food)}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{food.name}</p>
                <p className="text-xs text-muted-foreground">
                  {food.servingDesc} · {preview.calories} kcal
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <MacroChip label="P" value={Math.round(preview.protein)} color="protein" size="sm" />
                <MacroChip label="C" value={Math.round(preview.carbs)}   color="carbs"   size="sm" />
              </div>
            </button>
          );
        })}

        {/* Create food CTA */}
        <button
          type="button"
          onClick={onCreateFood}
          className="flex items-center gap-3 w-full px-4 py-4 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">Criar alimento personalizado</p>
            <p className="text-xs text-muted-foreground">Não encontrou? Adicione aqui.</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ── Step: create custom food ───────────────────────────────────────

function StepCreateFood({
  initialName,
  onCreated,
}: {
  initialName: string;
  onCreated: (food: FoodItem) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialName);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [serving, setServing] = useState(100);
  const [servingDesc, setServingDesc] = useState("100g");

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    const result = await createFoodItem({
      name: name.trim(),
      caloriesPer100g: calories,
      proteinPer100g: protein,
      carbsPer100g: carbs,
      fatsPer100g: fats,
      defaultServingG: serving,
      servingDesc: servingDesc || "100g",
    });
    setSaving(false);
    if (result) onCreated(result);
  }

  return (
    <div className="px-4 pb-8 pt-2 space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome</label>
        <input
          type="text"
          placeholder="Ex: Frango grelhado caseiro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Valores por 100g
      </p>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Calorias", unit: "kcal", value: calories, set: setCalories },
          { label: "Proteína", unit: "g",    value: protein,  set: setProtein  },
          { label: "Carboidratos", unit: "g", value: carbs,   set: setCarbs    },
          { label: "Gorduras", unit: "g",    value: fats,     set: setFats     },
        ].map(({ label, unit, value, set }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs text-muted-foreground">{label} ({unit})</label>
            <input
              type="number"
              min="0"
              step={unit === "kcal" ? 1 : 0.1}
              value={value || ""}
              onChange={(e) => set(Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Porção padrão (g)</label>
          <input
            type="number"
            min="1"
            value={serving || ""}
            onChange={(e) => setServing(Number(e.target.value))}
            className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Descrição da porção</label>
          <input
            type="text"
            placeholder="Ex: 1 filé"
            value={servingDesc}
            onChange={(e) => setServingDesc(e.target.value)}
            className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {saving ? "Salvando..." : "Salvar alimento"}
      </button>
    </div>
  );
}

// ── Step: adjust quantity ─────────────────────────────────────────

function StepQuantity({
  food,
  quantityG,
  saving,
  onChange,
  onConfirm,
}: {
  food: FoodItem;
  quantityG: number;
  saving: boolean;
  onChange: (g: number) => void;
  onConfirm: () => void;
}) {
  const totals = calcFoodTotals(food, quantityG);

  function adjust(delta: number) {
    onChange(Math.max(1, quantityG + delta));
  }

  return (
    <div className="px-4 pb-6 pt-2 space-y-5">
      {/* Food name */}
      <div className="text-center">
        <p className="font-semibold">{food.name}</p>
        <p className="text-xs text-muted-foreground">{food.servingDesc}</p>
      </div>

      {/* Quantity input */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => adjust(-10)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg font-bold hover:bg-muted/70 transition-colors"
        >
          −
        </button>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            min="1"
            value={quantityG}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 text-center text-3xl font-bold bg-transparent outline-none"
          />
          <span className="text-sm text-muted-foreground">g</span>
        </div>
        <button
          type="button"
          onClick={() => adjust(10)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg font-bold hover:bg-muted/70 transition-colors"
        >
          +
        </button>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 justify-center">
        {[50, 100, 150, 200].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className="rounded-xl px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/70 transition-colors"
          >
            {g}g
          </button>
        ))}
      </div>

      {/* Macro preview */}
      <div className="rounded-2xl bg-muted/50 p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Calorias", value: `${totals.calories}`,                        unit: "kcal" },
            { label: "Proteína", value: `${Math.round(totals.protein * 10) / 10}`,   unit: "g"    },
            { label: "Carbs",    value: `${Math.round(totals.carbs   * 10) / 10}`,   unit: "g"    },
            { label: "Gordura",  value: `${Math.round(totals.fats    * 10) / 10}`,   unit: "g"    },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-base font-bold">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.unit}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {saving ? "Salvando..." : "Adicionar à refeição"}
      </button>
    </div>
  );
}

// ── Main sheet ────────────────────────────────────────────────────

export function AddFoodSheet() {
  const {
    sheetOpen,
    sheetStep,
    draft,
    foodItems,
    foodSearch,
    saving,
    closeSheet,
    selectMeal,
    selectFood,
    setQuantity,
    setFoodSearch,
    setSheetStep,
    setSaving,
    onFoodAdded,
    onFoodItemCreated,
    goToCreateFood,
  } = useNutritionStore();

  const handleClose = useCallback(closeSheet, [closeSheet]);

  const stepTitles: Record<AddSheetStep, string> = {
    meal:        "Adicionar alimento",
    food:        "Escolher alimento",
    quantity:    "Ajustar quantidade",
    create_food: "Novo alimento",
  };

  function handleBack() {
    if (sheetStep === "food")        setSheetStep("meal");
    else if (sheetStep === "quantity")    setSheetStep("food");
    else if (sheetStep === "create_food") setSheetStep("food");
  }

  const canGoBack = sheetStep !== "meal";

  async function handleConfirm() {
    if (!draft.meal || !draft.food || saving) return;
    setSaving(true);

    const result = await addFoodToMeal(draft.meal, draft.food.id, draft.quantityG);

    if (result) {
      onFoodAdded(draft.meal, result);
      closeSheet();
    } else {
      setSaving(false);
    }
  }

  function handleFoodCreated(food: FoodItem) {
    onFoodItemCreated(food);
    selectFood(food); // navigate to quantity step with the new food pre-selected
  }

  const backHeader = canGoBack ? (
    <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-border">
      <button
        type="button"
        onClick={handleBack}
        className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <h2 className="text-base font-semibold flex-1">{stepTitles[sheetStep]}</h2>
    </div>
  ) : undefined;

  return (
    <BottomSheet
      open={sheetOpen}
      onClose={handleClose}
      title={canGoBack ? undefined : stepTitles[sheetStep]}
      header={backHeader}
    >
      {sheetStep === "meal" && <StepMeal onSelect={selectMeal} />}

      {sheetStep === "food" && (
        <StepFood
          foodItems={foodItems}
          onSelect={selectFood}
          search={foodSearch}
          onSearch={setFoodSearch}
          onCreateFood={goToCreateFood}
        />
      )}

      {sheetStep === "quantity" && draft.food && (
        <StepQuantity
          food={draft.food}
          quantityG={draft.quantityG}
          saving={saving}
          onChange={setQuantity}
          onConfirm={handleConfirm}
        />
      )}

      {sheetStep === "create_food" && (
        <StepCreateFood
          initialName={foodSearch}
          onCreated={handleFoodCreated}
        />
      )}
    </BottomSheet>
  );
}
