"use server";

import { createClient } from "@/lib/supabase/server";
import type { WeightEntry, BodyMeasurements, BodyGoal } from "@/lib/mock-progress";

// ── Extended photo type with signed URL ───────────────────────────

export interface ProgressPhotoWithUrl {
  id: string;
  date: string;
  label?: string;
  /** Signed URL (1h expiry) — undefined if bucket not configured */
  url?: string;
  storagePath: string;
}

// ── Initial data bundle passed to ProgressClient ─────────────────

export interface InitialProgressData {
  weightEntries: WeightEntry[];
  measurements: BodyMeasurements[];
  photos: ProgressPhotoWithUrl[];
  goal: BodyGoal;
}

// ── DB → domain adapters ──────────────────────────────────────────

type DbBodyMetric = {
  id: string;
  date: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  neck_cm: number | null;
  hip_cm: number | null;
  note: string | null;
};

function dbMetricToWeightEntry(row: DbBodyMetric): WeightEntry | null {
  if (row.weight_kg === null) return null;
  return {
    id: row.id,
    date: row.date,
    weight: row.weight_kg,
    bodyFatPct: row.body_fat_pct ?? undefined,
    note: row.note ?? undefined,
  };
}

function dbMetricToMeasurements(row: DbBodyMetric): BodyMeasurements | null {
  const has =
    row.waist_cm || row.chest_cm || row.arm_cm ||
    row.thigh_cm || row.neck_cm || row.hip_cm;
  if (!has) return null;
  return {
    id: row.id,
    date: row.date,
    waist:  row.waist_cm  ?? undefined,
    chest:  row.chest_cm  ?? undefined,
    arm:    row.arm_cm    ?? undefined,
    thigh:  row.thigh_cm  ?? undefined,
    neck:   row.neck_cm   ?? undefined,
    hip:    row.hip_cm    ?? undefined,
  };
}

// ── Queries ───────────────────────────────────────────────────────

/**
 * Fetches the user's progress data:
 *  - last 90 days of body_metrics (weight + measurements)
 *  - up to 10 progress_photos with signed URLs
 *  - target_weight_kg from their profile
 *
 * Returns safe empty fallback on any error.
 */
export async function getProgressData(): Promise<InitialProgressData> {
  const FALLBACK: InitialProgressData = {
    weightEntries: [],
    measurements: [],
    photos: [],
    goal: { targetWeight: 78 },
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return FALLBACK;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const [metricsRes, photosRes, profileRes] = await Promise.all([
      supabase
        .from("body_metrics")
        .select(
          "id, date, weight_kg, body_fat_pct, waist_cm, chest_cm, arm_cm, thigh_cm, neck_cm, hip_cm, note"
        )
        .gte("date", cutoffStr)
        .order("date", { ascending: false }),
      supabase
        .from("progress_photos")
        .select("id, date, storage_path, label")
        .order("date", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("target_weight_kg")
        .eq("id", user.id)
        .single(),
    ]);

    // --- Metrics ---
    const metrics = (metricsRes.data ?? []) as DbBodyMetric[];
    const weightEntries = metrics
      .map(dbMetricToWeightEntry)
      .filter((e): e is WeightEntry => e !== null);
    const measurements = metrics
      .map(dbMetricToMeasurements)
      .filter((m): m is BodyMeasurements => m !== null);

    // --- Photos with signed URLs ---
    const rawPhotos = photosRes.data ?? [];
    const photos = await Promise.all(
      rawPhotos.map(async (p) => {
        let url: string | undefined;
        try {
          const { data: signed } = await supabase.storage
            .from("progress-photos")
            .createSignedUrl(p.storage_path, 3600);
          url = signed?.signedUrl;
        } catch {
          // Bucket might not exist yet; show placeholder
        }
        return {
          id: p.id,
          date: p.date,
          label: p.label ?? undefined,
          storagePath: p.storage_path,
          url,
        } satisfies ProgressPhotoWithUrl;
      })
    );

    // --- Goal ---
    const targetWeight =
      profileRes.data?.target_weight_kg ?? FALLBACK.goal.targetWeight;
    const goal: BodyGoal = { targetWeight };

    return { weightEntries, measurements, photos, goal };
  } catch {
    return FALLBACK;
  }
}

// ── Mutations ─────────────────────────────────────────────────────

export interface ProgressEntryInput {
  weight: string;
  bodyFatPct: string;
  waist: string;
  chest: string;
  arm: string;
  thigh: string;
  note: string;
}

/**
 * Upserts a body_metrics row for today.
 * Returns the created entry and measurements (if any), or null on error.
 */
export async function saveProgressEntry(
  input: ProgressEntryInput
): Promise<{ entry: WeightEntry; measurement: BodyMeasurements | null } | null> {
  const weight = parseFloat(input.weight.replace(",", "."));
  if (isNaN(weight) || weight <= 0) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const date = new Date().toISOString().slice(0, 10);

    const row = {
      user_id:      user.id,
      date,
      weight_kg:    weight,
      body_fat_pct: input.bodyFatPct ? parseFloat(input.bodyFatPct.replace(",", ".")) : null,
      waist_cm:     input.waist   ? parseFloat(input.waist)   : null,
      chest_cm:     input.chest   ? parseFloat(input.chest)   : null,
      arm_cm:       input.arm     ? parseFloat(input.arm)     : null,
      thigh_cm:     input.thigh   ? parseFloat(input.thigh)   : null,
      note:         input.note    || null,
    };

    const { data, error } = await supabase
      .from("body_metrics")
      .upsert(row, { onConflict: "user_id,date" })
      .select("id, date, weight_kg, body_fat_pct, waist_cm, chest_cm, arm_cm, thigh_cm, neck_cm, hip_cm, note")
      .single();

    if (error || !data) return null;

    const metric = data as DbBodyMetric;
    const entry = dbMetricToWeightEntry(metric);
    if (!entry) return null;

    return { entry, measurement: dbMetricToMeasurements(metric) };
  } catch {
    return null;
  }
}

/**
 * Inserts a progress_photos record after the client has uploaded the file to Storage.
 * Returns the saved photo or null on error.
 */
export async function saveProgressPhotoRecord(
  storagePath: string,
  date: string,
  label: string | undefined
): Promise<{ id: string; date: string; label?: string; storagePath: string } | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("progress_photos")
      .insert({ user_id: user.id, date, storage_path: storagePath, label: label ?? null })
      .select("id, date, label, storage_path")
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      date: data.date,
      label: data.label ?? undefined,
      storagePath: data.storage_path,
    };
  } catch {
    return null;
  }
}

// ── Home page helper ──────────────────────────────────────────────

export interface WeightSummary {
  current: number;
  previous: number;
  goal: number;
}

/**
 * Light query for the Home page WeightWidget.
 * Fetches only the 2 most recent weight entries + goal from profile.
 * Returns null when the user has no records yet (WeightWidget falls back to mock).
 */
export async function getWeightSummary(): Promise<WeightSummary | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [metricsRes, profileRes] = await Promise.all([
      supabase
        .from("body_metrics")
        .select("weight_kg")
        .not("weight_kg", "is", null)
        .order("date", { ascending: false })
        .limit(2),
      supabase
        .from("profiles")
        .select("target_weight_kg")
        .eq("id", user.id)
        .single(),
    ]);

    const entries = metricsRes.data ?? [];
    if (!entries.length) return null;

    const current = entries[0].weight_kg as number;
    const previous = (entries[1]?.weight_kg as number | undefined) ?? current;
    const goal = profileRes.data?.target_weight_kg ?? 78;

    return { current, previous, goal };
  } catch {
    return null;
  }
}
