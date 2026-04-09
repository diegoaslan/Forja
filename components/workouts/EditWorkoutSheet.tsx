"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronLeft, ChevronUp, ChevronDown } from "lucide-react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { updateWorkout } from "@/lib/actions/workouts";
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

// ── Types ─────────────────────────────────────────────────────────

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroupName: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  defaultWeightKg: number;
  notes: string;
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
    notes: "",
  };
}

// ── Step 1: detalhes ──────────────────────────────────────────────

function StepDetails({
  name, setName, category, setCategory, description, setDescription,
  estimatedMinutes, setEstimatedMinutes, onNext,
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

// ── Step 2: exercícios ────────────────────────────────────────────

function StepExercises({
  exercises, onChange, onAdd, onRemove, onMoveUp, onMoveDown, saving, onSave,
}: {
  exercises: ExerciseItem[];
  onChange: (id: string, field: keyof ExerciseItem, value: string | number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
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
          {/* Cabeçalho: número + reordenação + remover */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Exercício {idx + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMoveUp(ex.id)}
                disabled={idx === 0}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                aria-label="Mover para cima"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(ex.id)}
                disabled={idx === exercises.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(ex.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                aria-label="Remover exercício"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          </div>

          {/* Nome */}
          <input
            type="text"
            placeholder="Nome do exercício"
            value={ex.name}
            onChange={(e) => onChange(ex.id, "name", e.target.value)}
            className="w-full rounded-xl bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />

          {/* Séries + Repetições */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Séries</label>
              <input
                type="number"
                min="1"
                max="10"
                value={ex.targetSets}
                onChange={(e) => onChange(ex.id, "targetSets", Number(e.target.value))}
                className="w-full rounded-xl bg-background px-3 py-2 text-sm text-center outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Repetições</label>
              <input
                type="text"
                placeholder="Ex: 10-12"
                value={ex.targetReps}
                onChange={(e) => onChange(ex.id, "targetReps", e.target.value)}
                className="w-full rounded-xl bg-background px-3 py-2 text-sm text-center outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Descanso + Peso padrão */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Descanso (seg)</label>
              <input
                type="number"
                min="0"
                step="15"
                value={ex.restSeconds}
                onChange={(e) => onChange(ex.id, "restSeconds", Number(e.target.value))}
                className="w-full rounded-xl bg-background px-3 py-2 text-sm text-center outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Peso padrão (kg)</label>
              <input
                type="number"
                min="0"
                step="2.5"
                value={ex.defaultWeightKg}
                onChange={(e) => onChange(ex.id, "defaultWeightKg", Number(e.target.value))}
                className="w-full rounded-xl bg-background px-3 py-2 text-sm text-center outline-none"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Observações (opcional)</label>
            <input
              type="text"
              placeholder="Ex: pegada supinada, foco na contração..."
              value={ex.notes}
              onChange={(e) => onChange(ex.id, "notes", e.target.value)}
              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
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
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────

interface EditWorkoutSheetProps {
  workout: Workout;
  open: boolean;
  onClose: () => void;
}

function workoutToExercises(workout: Workout): ExerciseItem[] {
  return workout.exercises.map((we) => ({
    id: we.id,
    name: we.exercise.name,
    muscleGroupName: we.exercise.muscleGroup.name ?? "",
    targetSets: we.targetSets,
    targetReps: we.targetReps,
    restSeconds: we.restSeconds,
    defaultWeightKg: we.defaultWeightKg,
    notes: we.notes ?? "",
  }));
}

export function EditWorkoutSheet({ workout, open, onClose }: EditWorkoutSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "exercises">("details");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(workout.name);
  const [category, setCategory] = useState<Workout["category"]>(workout.category);
  const [description, setDescription] = useState(workout.description ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(workout.estimatedMinutes);
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => workoutToExercises(workout));

  // Sincroniza estado do form com os dados atuais do treino toda vez que o sheet abre.
  // Garante que após um save + router.refresh(), reabrir o sheet mostra dados frescos.
  useEffect(() => {
    if (open) {
      setStep("details");
      setError(null);
      setName(workout.name);
      setCategory(workout.category);
      setDescription(workout.description ?? "");
      setEstimatedMinutes(workout.estimatedMinutes);
      setExercises(workoutToExercises(workout));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function changeExercise(id: string, field: keyof ExerciseItem, value: string | number) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }

  function moveExercise(id: string, direction: "up" | "down") {
    setExercises((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  async function handleSave() {
    if (saving) return;
    setError(null);
    setSaving(true);

    const result = await updateWorkout(workout.id, {
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
          notes: ex.notes,
        })),
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
    router.refresh();
  }

  const stepTitles = { details: "Editar treino", exercises: "Exercícios" };

  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* Header */}
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

      {error && (
        <p className="mx-4 mt-3 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

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
          onMoveUp={(id) => moveExercise(id, "up")}
          onMoveDown={(id) => moveExercise(id, "down")}
          saving={saving}
          onSave={handleSave}
        />
      )}
    </BottomSheet>
  );
}
