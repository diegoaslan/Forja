"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleHabitLog } from "@/lib/actions/habits";

interface HabitItem {
  id: string;
  name: string;
  icon: string;
}

interface DailyChecklistProps {
  items: HabitItem[];
  initialCompleted: string[];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DailyChecklist({
  items,
  initialCompleted,
}: DailyChecklistProps) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  const [animating, setAnimating] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setAnimating((prev) => new Set(prev).add(id));

    setCompleted((prev) => {
      const next = new Set(prev);
      const nowCompleted = !next.has(id);
      if (nowCompleted) {
        next.add(id);
      } else {
        next.delete(id);
      }
      // Fire-and-forget persistence
      toggleHabitLog(id, todayISO(), nowCompleted).catch(() => {});
      return next;
    });

    setTimeout(() => {
      setAnimating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Check-in de hoje</h2>
        <Card className="border-0 card-shadow">
          <CardContent className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum hábito ativo. Adicione hábitos para acompanhar seu progresso diário.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const done = completed.size;
  const total = items.length;

  // Exibe itens incompletos primeiro
  const sorted = [...items].sort((a, b) => {
    const aDone = completed.has(a.id) ? 1 : 0;
    const bDone = completed.has(b.id) ? 1 : 0;
    return aDone - bDone;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Check-in de hoje</h2>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-semibold tabular-nums transition-colors",
            done === total && "bg-green-50 text-green-700"
          )}
        >
          {done}/{total}
        </Badge>
      </div>

      <Card className="border-0 card-shadow overflow-hidden">
        <CardContent className="p-0 divide-y divide-border">
          {sorted.map((item, i) => {
            const isDone = completed.has(item.id);
            const isAnimating = animating.has(item.id);

            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                  "active:bg-muted/60 focus-visible:bg-muted/40",
                  "hover:bg-muted/30",
                  i === 0 && "rounded-t-2xl",
                  i === sorted.length - 1 && "rounded-b-2xl",
                  isDone && "bg-muted/20"
                )}
              >
                {/* Ícone do hábito */}
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-300",
                    isDone ? "bg-primary/10" : "bg-muted",
                    isAnimating && "scale-110"
                  )}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "flex-1 text-sm font-medium transition-all duration-300",
                    isDone && "text-muted-foreground line-through decoration-muted-foreground/50"
                  )}
                >
                  {item.name}
                </span>

                {/* Check icon */}
                <span
                  className={cn(
                    "shrink-0 transition-all duration-300",
                    isAnimating && "scale-125"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2
                      className="h-5 w-5 text-primary"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Circle
                      className="h-5 w-5 text-muted-foreground/30"
                      strokeWidth={1.5}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {done === total && (
        <p className="text-center text-xs text-primary font-medium py-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          🏆 Dia perfeito! Todas as tarefas concluídas.
        </p>
      )}
    </div>
  );
}
