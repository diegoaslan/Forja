import type { Metadata } from "next";
import { getNutritionDayData } from "@/lib/actions/nutrition";
import { NutritionClient } from "@/components/nutrition/NutritionClient";

export const metadata: Metadata = { title: "Nutrição" };

export default async function NutritionPage() {
  const initialData = await getNutritionDayData();

  return <NutritionClient initialData={initialData} />;
}
