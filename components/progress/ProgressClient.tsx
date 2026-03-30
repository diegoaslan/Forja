"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { ProgressHero } from "./ProgressHero";
import { ProgressChart } from "./ProgressChart";
import { BodyMetricsCard } from "./BodyMetricsCard";
import { MetricsComparisonCard } from "./MetricsComparisonCard";
import { ProgressPhotosCard } from "./ProgressPhotosCard";
import { AddProgressEntrySheet } from "./AddProgressEntrySheet";
import { ProgressEmptyState } from "./ProgressEmptyState";
import { ProgressSkeleton } from "./ProgressSkeleton";
import type { InitialProgressData } from "@/lib/actions/progress";

// ── Props ─────────────────────────────────────────────────────────

interface ProgressClientProps {
  initialData: InitialProgressData;
}

// ── Helpers ───────────────────────────────────────────────────────

function latestWeight(
  entries: InitialProgressData["weightEntries"]
) {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];
}

function weightChangeOverPeriod(
  entries: InitialProgressData["weightEntries"],
  days: number
): number | null {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length < 2) return null;
  const newest = sorted[0];
  const cutoff = new Date(newest.date);
  cutoff.setDate(cutoff.getDate() - days);
  const oldest = sorted.find(
    (e) => e.date <= cutoff.toISOString().slice(0, 10)
  );
  if (!oldest) return null;
  return Math.round((newest.weight - oldest.weight) * 10) / 10;
}

// ── Component ─────────────────────────────────────────────────────

export function ProgressClient({ initialData }: ProgressClientProps) {
  const store = useProgressStore();

  // Initialize store from server-fetched data (once on mount)
  useEffect(() => {
    store.initialize(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { weightEntries, measurements, photos, goal, openSheet, initialized } = store;

  const latest = latestWeight(weightEntries);
  const monthChange = weightChangeOverPeriod(weightEntries, 30);

  const sortedMeasurements = [...measurements].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const latestMeasurement = sortedMeasurements[0];
  const previousMeasurement = sortedMeasurements[1];

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto md:max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight">Progresso</h1>
          <button
            type="button"
            onClick={openSheet}
            className="flex items-center gap-1.5 rounded-xl px-3 h-9 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Registrar
          </button>
        </div>
      </header>

      {/* Show skeleton until store is initialized */}
      {!initialized ? (
        <ProgressSkeleton />
      ) : !latest ? (
        <ProgressEmptyState onAdd={openSheet} />
      ) : (
        <div className="space-y-3 pb-24 md:pb-8 max-w-lg mx-auto md:max-w-2xl">
          {/* Hero — weight + goal bar */}
          <ProgressHero latest={latest} monthChange={monthChange} goal={goal} />

          {/* Weight evolution chart */}
          <ProgressChart entries={weightEntries} goal={goal} />

          {/* Current body measurements */}
          {latestMeasurement && <BodyMetricsCard latest={latestMeasurement} />}

          {/* Before/after comparison */}
          {latestMeasurement && previousMeasurement && (
            <MetricsComparisonCard
              before={previousMeasurement}
              after={latestMeasurement}
            />
          )}

          {/* Progress photos */}
          <ProgressPhotosCard photos={photos} />
        </div>
      )}

      {/* Add entry sheet */}
      <AddProgressEntrySheet />
    </>
  );
}
