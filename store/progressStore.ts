"use client";

import { create } from "zustand";
import type { WeightEntry, BodyMeasurements, BodyGoal } from "@/lib/mock-progress";
import type { ProgressPhotoWithUrl, InitialProgressData } from "@/lib/actions/progress";

// ── Form draft ────────────────────────────────────────────────────

export interface NewEntryDraft {
  weight: string;
  bodyFatPct: string;
  waist: string;
  chest: string;
  arm: string;
  thigh: string;
  note: string;
}

const EMPTY_DRAFT: NewEntryDraft = {
  weight: "",
  bodyFatPct: "",
  waist: "",
  chest: "",
  arm: "",
  thigh: "",
  note: "",
};

// ── Store ─────────────────────────────────────────────────────────

interface ProgressStore {
  weightEntries: WeightEntry[];
  measurements: BodyMeasurements[];
  photos: ProgressPhotoWithUrl[];
  goal: BodyGoal;
  initialized: boolean;

  // Sheet
  sheetOpen: boolean;
  draft: NewEntryDraft;
  saving: boolean;

  // Actions
  initialize: (data: InitialProgressData) => void;
  openSheet: () => void;
  closeSheet: () => void;
  updateDraft: (field: keyof NewEntryDraft, value: string) => void;
  setSaving: (saving: boolean) => void;

  /** Called after a server action successfully saves a new body_metrics row */
  onEntrySaved: (entry: WeightEntry, measurement: BodyMeasurements | null) => void;

  /** Called after a photo is uploaded and the DB record is saved */
  onPhotoSaved: (photo: ProgressPhotoWithUrl) => void;
}

// ── Helpers ───────────────────────────────────────────────────────

function latestEntry(entries: WeightEntry[]): WeightEntry | undefined {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];
}

// ── Create store ──────────────────────────────────────────────────

export const useProgressStore = create<ProgressStore>((set, get) => ({
  weightEntries: [],
  measurements: [],
  photos: [],
  goal: { targetWeight: 78 },
  initialized: false,
  sheetOpen: false,
  draft: EMPTY_DRAFT,
  saving: false,

  initialize: (data) =>
    set({
      weightEntries: data.weightEntries,
      measurements:  data.measurements,
      photos:        data.photos,
      goal:          data.goal,
      initialized:   true,
    }),

  openSheet: () => {
    const latest = latestEntry(get().weightEntries);
    set({
      sheetOpen: true,
      draft: {
        ...EMPTY_DRAFT,
        weight:     latest ? String(latest.weight) : "",
        bodyFatPct: latest?.bodyFatPct ? String(latest.bodyFatPct) : "",
      },
    });
  },

  closeSheet: () => set({ sheetOpen: false, draft: EMPTY_DRAFT, saving: false }),

  updateDraft: (field, value) =>
    set((state) => ({ draft: { ...state.draft, [field]: value } })),

  setSaving: (saving) => set({ saving }),

  onEntrySaved: (entry, measurement) =>
    set((state) => {
      // Upsert by date — replace if same day exists
      const newEntries = [
        ...state.weightEntries.filter((e) => e.date !== entry.date),
        entry,
      ];
      const newMeasurements = measurement
        ? [...state.measurements.filter((m) => m.date !== entry.date), measurement]
        : state.measurements;

      return {
        weightEntries: newEntries,
        measurements:  newMeasurements,
        sheetOpen:     false,
        draft:         EMPTY_DRAFT,
        saving:        false,
      };
    }),

  onPhotoSaved: (photo) =>
    set((state) => ({
      // Max 10 photos; newest first
      photos: [photo, ...state.photos].slice(0, 10),
    })),
}));
