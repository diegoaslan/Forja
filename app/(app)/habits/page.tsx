import type { Metadata } from "next";
import { getHabitsWithLogs } from "@/lib/actions/habits";
import { HabitsClient } from "@/components/habits/HabitsClient";

export const metadata: Metadata = { title: "Hábitos" };

export default async function HabitsPage() {
  const { habits, logs } = await getHabitsWithLogs();

  return <HabitsClient initialHabits={habits} initialLogs={logs} />;
}
