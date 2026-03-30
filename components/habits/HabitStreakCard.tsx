import { Flame, Trophy } from "lucide-react";
import { HabitCompletionRing } from "./HabitCompletionRing";
import { cn } from "@/lib/utils";

interface HabitStreakCardProps {
  completed: number;
  total: number;
  overallStreak: number;
}

export function HabitStreakCard({ completed, total, overallStreak }: HabitStreakCardProps) {
  const allDone = completed === total && total > 0;

  return (
    <div
      className={cn(
        "mx-4 mt-4 rounded-3xl p-5 text-white",
        allDone ? "bg-gradient-to-br from-green-500 to-emerald-600" : "gradient-primary"
      )}
    >
      <div className="flex items-center gap-5">
        {/* Ring */}
        <HabitCompletionRing completed={completed} total={total} size={72} />

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold opacity-90">
            {allDone
              ? "Todos os hábitos concluídos! 🎉"
              : `${total - completed} hábito${total - completed > 1 ? "s" : ""} restante${total - completed > 1 ? "s" : ""}`}
          </p>
          <p className="text-xs opacity-70 mt-0.5">
            {completed} de {total} hoje
          </p>

          {/* Streak badge */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {overallStreak} dias seguidos
              </span>
            </div>
            {overallStreak >= 7 && (
              <div className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
                <Trophy className="h-3 w-3" />
                <span className="text-xs font-semibold">
                  {overallStreak >= 30 ? "Mês!" : overallStreak >= 7 ? "Semana!" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
