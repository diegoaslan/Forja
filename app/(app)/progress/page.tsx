import type { Metadata } from "next";
import { getProgressData } from "@/lib/actions/progress";
import { ProgressClient } from "@/components/progress/ProgressClient";

export const metadata: Metadata = { title: "Progresso" };

export default async function ProgressPage() {
  const initialData = await getProgressData();

  return <ProgressClient initialData={initialData} />;
}
