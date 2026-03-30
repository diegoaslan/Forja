"use client";

import { AnalyticsHero } from "./AnalyticsHero";
import { WeeklySummaryCard } from "./WeeklySummaryCard";
import { WorkoutAnalyticsCard } from "./WorkoutAnalyticsCard";
import { NutritionAnalyticsCard } from "./NutritionAnalyticsCard";
import { HabitsAnalyticsCard } from "./HabitsAnalyticsCard";
import { ProgressAnalyticsCard } from "./ProgressAnalyticsCard";
import type { AnalyticsData } from "@/lib/actions/analytics";

interface AnalyticsClientProps {
  data: AnalyticsData;
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 h-14 max-w-lg mx-auto md:max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight">Analytics</h1>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-3 pb-24 md:pb-8 max-w-lg mx-auto md:max-w-2xl">
        <AnalyticsHero score={data.weeklyScore} />
        <WeeklySummaryCard data={data} />
        <WorkoutAnalyticsCard data={data} />
        <NutritionAnalyticsCard data={data} />
        <HabitsAnalyticsCard data={data} />
        <ProgressAnalyticsCard data={data} />
      </div>
    </>
  );
}
