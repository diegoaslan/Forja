"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronLeft } from "lucide-react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { createWorkout } from "@/lib/actions/workouts";
import { cn } from "@/lib/utils";
import type { Workout } from "@/lib/mock-workouts";

// ── Config ────────────────────────────────────────────────────────

const CATEGORIES: Array<{ key: Workout["category"]; label: string }> = [
  { key: "push",   label: "Push (Empurrar)" },
  { key: "pull",   label: "Pull (Puxar)"    },
  { key: "legs",   label: "Pernas"          },
  { key: "upper",  label: "Superior"        },
  { key: "lower",  label: "Inferior"        },
  { key: "full",   label: "Full Body"       },
  { key: "cardio", label: "Cardio"          },
];

const MUSCLE_GROUPS = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Pernas", "Glúteos", "Core", "Panturrilha", "Cardio",
];

// ── Exercise form item ────────────────────────────────────────────

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroupName: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  defaultWeightKg: number;
}

function newExercise(): ExerciseItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    muscleGroupName: "",
    targetSets: 3,
    targetReps: "8-12",
    restSeconds: 90,
    defaultWeightKg: 0,
  };
}

// ── Step 1: Workout details ───────────────────────────────────────

function StepDetails({
  name, setName, category, setCategory, description, setDescription, estimatedMinutes, setEstimatedMinutes, onNext,
}: {
  name: string; setName: (v: string) => void;
  category: Workout["category"]; setCategory: (v: Workout["category"]) => void;
  description: string; setDescription: (v: string) => void;
  estimatedMinutes: number; setEstimatedMinutes: (v: number) => void;
  onNext: () => void;
}) {
  return (
    <div className="px-4 pb-8 pt-2 space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome do treino</label>
        <input
          type="text"
          placeholder="Ex: Push Day A, Leg Day..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left",
                category === key ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descrição (opcional)</label>
        <textarea
          placeholder="Peito, ombros e tríceps..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Duração estimada: {estimatedMinutes} min
        </label>
        <div className="flex gap-2 flex-wrap">
          {[30, 45, 60, 75, 90].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setEstimatedMinutes(m)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                estimatedMinutes === m ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
              )}
            >
              {m}min
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!name.trim()}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        Próximo: exercícios
      </button>
    </div>
  );
}

// ── Step 2: Exercises ─────────────────────────────────────────────

function StepExercises({
  exercises, onChange, onAdd, onRemove, saving, onSave,
}: {
  exercises: ExerciseItem[];
  onChange: (id: string, field: keyof ExerciseItem, value: string | number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="px-4 pb-8 pt-2 space-y-4">
      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum exercício ainda. Adicione abaixo.
        </p>
      )}

      {exercises.map((ex, idx) => (
        <div key={ex.id} className="rounded-2xl bg-muted/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Exercício {idx + 1}</span>
            <button
              type="button"
              onClick={() => onRemove(ex.id)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Nome do exercício"
            value={ex.name}
            onChange={(e) => onChange(ex.id, "name", e.target.value)}
            className="w-full rounded-xl bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />

          <div className="flex gap-2 flex-wrap">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg}
                type="button"
                onClick={() => onChange(ex.id, "muscleGroupName", mg)}
                className={cn(
                  "rounded-xl px-2.5 py-1 text-xs font-medium transition-colors",
                  ex.muscleGroupName === mg
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                )}
              >
                {mg}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Séries</label>
              <input
                type="number"
                min="1" max="10"
                value={ex.targetSets}
                onChange={(e) => onChange(ex.id, "targetSets", Number(e.target.value))}
                className="w-full rounded-xl bg-background px-3 py-2 text-sm text-center outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Reps</label>
              <input
                type="text"
                placeholder="8-12"
                value={ex.targetReps}
                onChange={(e) => onChange(ex.id, "targetReps", e.target.value)}
                className="w-full rounded-xl bg-background px-3 py-2 text-sm text-center outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Descanso</label>
              <select
                value={ex.restSeconds}
                onChange={(e) => onChange(ex.id, "restSeconds", Number(e.target.value))}
                className="w-full rounded-xl bg-background px-2 py-2 text-sm outline-none"
              >
                {[30, 45, 60, 90, 120, 180, 240].map((s) => (
                  <option key={s} value={s}>
                    {s < 60 ? `${s}s` : `${s / 60}min`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Peso padrão (kg) — opcional</label>
            <input
              type="number"
              min="0"
              value={ex.defaultWeightKg || ""}
              onChange={(e) => onChange(ex.id, "defaultWeightKg", Number(e.target.value))}
              placeholder="0"
              className="w-32 rounded-xl bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Adicionar exercício
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {saving ? "Salvando..." : "Criar treino"}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export function CreateWorkoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "exercises">("details");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Workout["category"]>("push");
  const [description, setDescription] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);

  function close() {
    setOpen(false);
    setStep("details");
    setName(""); setCategory("push"); setDescription(""); setEstimatedMinutes(45); setExercises([]);
  }

  function changeExercise(id: string, field: keyof ExerciseItem, value: string | number) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const id = await createWorkout({
      name: name.trim(),
      category,
      description,
      estimatedMinutes,
      exercises: exercises
        .filter((ex) => ex.name.trim())
        .map((ex) => ({
          name: ex.name.trim(),
          muscleGroupName: ex.muscleGroupName,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps || "8-12",
          restSeconds: ex.restSeconds,
          defaultWeightKg: ex.defaultWeightKg,
        })),
    });
    setSaving(false);
    if (id) {
      close();
      router.refresh();
    }
  }

  const stepTitles = { details: "Novo treino", exercises: "Exercícios" };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Novo
      </button>

      <BottomSheet open={open} onClose={close}>
        {/* Custom header */}
        <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-border">
          {step === "exercises" && (
            <button
              type="button"
              onClick={() => setStep("details")}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-base font-semibold flex-1">{stepTitles[step]}</h2>
        </div>

        {step === "details" && (
          <StepDetails
            name={name} setName={setName}
            category={category} setCategory={setCategory}
            description={description} setDescription={setDescription}
            estimatedMinutes={estimatedMinutes} setEstimatedMinutes={setEstimatedMinutes}
            onNext={() => setStep("exercises")}
          />
        )}
        {step === "exercises" && (
          <StepExercises
            exercises={exercises}
            onChange={changeExercise}
            onAdd={() => setExercises((prev) => [...prev, newExercise()])}
            onRemove={(id) => setExercises((prev) => prev.filter((e) => e.id !== id))}
            saving={saving}
            onSave={handleSave}
          />
        )}
      </BottomSheet>
    </>
  );
}
