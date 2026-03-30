"use client";

import { Check, Loader2 } from "lucide-react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { useProgressStore } from "@/store/progressStore";
import { saveProgressEntry } from "@/lib/actions/progress";

// ── Input helper ──────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  unit?: string;
}

function InputField({ label, value, onChange, placeholder, unit }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 bg-muted rounded-xl px-3 h-11">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/60"
        />
        {unit && <span className="text-xs text-muted-foreground shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

// ── Sheet ─────────────────────────────────────────────────────────

export function AddProgressEntrySheet() {
  const {
    sheetOpen,
    draft,
    saving,
    closeSheet,
    updateDraft,
    setSaving,
    onEntrySaved,
  } = useProgressStore();

  const weightNum = parseFloat(draft.weight.replace(",", "."));
  const canConfirm = !isNaN(weightNum) && weightNum > 0;

  async function handleConfirm() {
    if (!canConfirm || saving) return;
    setSaving(true);

    const result = await saveProgressEntry(draft);

    if (result) {
      onEntrySaved(result.entry, result.measurement);
    } else {
      // Silent failure — keep sheet open so user can retry
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={sheetOpen} onClose={closeSheet} title="Novo registro">
      <div className="px-4 pb-6 pt-2 space-y-5">
        {/* Weight section */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Peso
          </p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Peso *"
              value={draft.weight}
              onChange={(v) => updateDraft("weight", v)}
              placeholder="82,0"
              unit="kg"
            />
            <InputField
              label="% Gordura"
              value={draft.bodyFatPct}
              onChange={(v) => updateDraft("bodyFatPct", v)}
              placeholder="16,5"
              unit="%"
            />
          </div>
        </div>

        {/* Measurements section */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Medidas <span className="normal-case font-normal">(opcional)</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Cintura"
              value={draft.waist}
              onChange={(v) => updateDraft("waist", v)}
              placeholder="84"
              unit="cm"
            />
            <InputField
              label="Peito"
              value={draft.chest}
              onChange={(v) => updateDraft("chest", v)}
              placeholder="99"
              unit="cm"
            />
            <InputField
              label="Braço"
              value={draft.arm}
              onChange={(v) => updateDraft("arm", v)}
              placeholder="36"
              unit="cm"
            />
            <InputField
              label="Coxa"
              value={draft.thigh}
              onChange={(v) => updateDraft("thigh", v)}
              placeholder="58"
              unit="cm"
            />
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Observação</label>
          <textarea
            value={draft.note}
            onChange={(e) => updateDraft("note", e.target.value)}
            placeholder="Como você está se sentindo..."
            rows={2}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 resize-none"
          />
        </div>

        {/* Confirm */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm || saving}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {saving ? "Salvando..." : "Salvar registro"}
        </button>
      </div>
    </BottomSheet>
  );
}
