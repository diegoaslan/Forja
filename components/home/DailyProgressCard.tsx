import { ProgressRing } from "@/components/shared/ProgressRing";

interface DailyProgressCardProps {
  done: number;
  total: number;
  streakDays: number;
}

const motivationalMessages = (pct: number): string => {
  if (pct === 0) return "Vamos lá! O dia acabou de começar.";
  if (pct < 30) return "Bom começo! Continue assim.";
  if (pct < 60) return "Você está no caminho certo.";
  if (pct < 100) return "Quase lá! Não pare agora.";
  return "Dia perfeito! Missão cumprida. 🏆";
};

export function DailyProgressCard({
  done,
  total,
  streakDays,
}: DailyProgressCardProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const remaining = total - done;

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 text-white card-shadow">
      {/* Círculo decorativo de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5"
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* Texto */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium opacity-90">Progresso do dia</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold leading-none">{done}</span>
            <span className="text-xl font-normal opacity-70">/ {total}</span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            {remaining > 0
              ? `${remaining} ${remaining === 1 ? "tarefa restante" : "tarefas restantes"}`
              : "Todas as tarefas concluídas!"}
          </p>
          <p className="text-xs opacity-70 italic">{motivationalMessages(pct)}</p>
        </div>

        {/* Anel de progresso */}
        <ProgressRing value={pct} size={88} strokeWidth={7}>
          <div className="flex flex-col items-center leading-none">
            <span className="text-xl font-bold">{pct}%</span>
          </div>
        </ProgressRing>
      </div>

      {/* Barra linear + streak */}
      <div className="relative mt-4 space-y-2">
        <div className="flex justify-between text-xs opacity-80">
          <span>Conclusão</span>
          <span className="font-medium">🔥 {streakDays} dias de streak</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
