"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { createHabit } from "@/lib/actions/habits";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = [
  { key: "mon", label: "Seg" },
  { key: "tue", label: "Ter" },
  { key: "wed", label: "Qua" },
  { key: "thu", label: "Qui" },
  { key: "fri", label: "Sex" },
  { key: "sat", label: "Sáb" },
  { key: "sun", label: "Dom" },
] as const;

const CATEGORIES = [
  { key: "health",  label: "Saúde",         icon: "🏥" },
  { key: "fitness", label: "Fitness",        icon: "💪" },
  { key: "mindset", label: "Mindset",        icon: "🧘" },
  { key: "custom",  label: "Personalizado",  icon: "⭐" },
] as const;

const INITIAL_STATE = {
  name: "",
  icon: "✅",
  category: "health",
  isDaily: true,
  selectedDays: ["mon", "tue", "wed", "thu", "fri"] as string[],
};

export function CreateHabitButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_STATE);

  function close() {
    setOpen(false);
    setForm(INITIAL_STATE);
  }

  function toggleDay(day: string) {
    setForm((f) => ({
      ...f,
      selectedDays: f.selectedDays.includes(day)
        ? f.selectedDays.filter((d) => d !== day)
        : [...f.selectedDays, day],
    }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    const result = await createHabit({
      name: form.name.trim(),
      icon: form.icon || "✅",
      category: form.category,
      targetDays: form.isDaily ? null : form.selectedDays,
    });
    setSaving(false);
    if (result.success) {
      close();
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        aria-label="Criar hábito"
      >
        <Plus className="h-4 w-4" />
      </button>

      <BottomSheet open={open} onClose={close} title="Novo hábito">
        <div className="px-4 pb-8 pt-2 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nome
            </label>
            <input
              type="text"
              placeholder="Ex: Beber água, Meditar..."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Ícone (emoji)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="w-20 rounded-xl bg-muted px-4 py-3 text-xl text-center outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: key }))}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    form.category === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/70"
                  )}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Frequência
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isDaily: true }))}
                className={cn(
                  "flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  form.isDaily
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                Todo dia
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isDaily: false }))}
                className={cn(
                  "flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  !form.isDaily
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                Dias específicos
              </button>
            </div>
            {!form.isDaily && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {WEEKDAY_LABELS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                      form.selectedDays.includes(key)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/70"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.name.trim() || saving}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Criar hábito"}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
