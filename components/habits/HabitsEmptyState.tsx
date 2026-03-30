import { Plus } from "lucide-react";

interface HabitsEmptyStateProps {
  onAdd?: () => void;
}

export function HabitsEmptyState({ onAdd }: HabitsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-3xl">
        🌱
      </div>
      <div>
        <p className="font-semibold">Nenhum hábito ainda</p>
        <p className="text-sm text-muted-foreground mt-1">
          Crie seus primeiros hábitos e comece a construir consistência.
        </p>
      </div>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-1"
        >
          <Plus className="h-4 w-4" />
          Criar hábito
        </button>
      )}
    </div>
  );
}
