import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getGoals } from "@/lib/actions/settings";
import { GoalsForm } from "@/components/settings/GoalsForm";

export const metadata: Metadata = { title: "Metas" };

export default async function SettingsPage() {
  const goals = await getGoals();

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-screen">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2 px-4 h-14 max-w-lg mx-auto md:max-w-2xl">
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Metas e objetivos</h1>
        </div>
      </header>

      <div className="pt-4 max-w-lg mx-auto md:max-w-2xl w-full">
        <GoalsForm initial={goals} />
      </div>
    </div>
  );
}
