"use client";

import { X, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  onDismiss: () => void;
}

export function RestTimer({ secondsLeft, totalSeconds, onDismiss }: RestTimerProps) {
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isLow = secondsLeft <= 10;

  // SVG circular progress
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card border-t-2 border-primary/20",
        "flex items-center gap-4 px-4 py-3",
        "shadow-[0_-4px_24px_rgba(0,0,0,0.08)]",
        // Animação de entrada
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      {/* Anel de contagem */}
      <div className="relative shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              "transition-all duration-1000 ease-linear",
              isLow ? "text-rose-500" : "text-primary"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-xs font-bold tabular-nums",
              isLow ? "text-rose-500" : "text-primary"
            )}
          >
            {secondsLeft}
          </span>
        </div>
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Descanso</p>
        <p className="text-xs text-muted-foreground">
          {secondsLeft === 0
            ? "Hora da próxima série! 💪"
            : `${secondsLeft}s restantes`}
        </p>
      </div>

      {/* Pular */}
      <button
        type="button"
        onClick={onDismiss}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium",
          "bg-primary text-primary-foreground",
          "active:opacity-80 transition-opacity"
        )}
      >
        <SkipForward className="h-4 w-4" />
        Pular
      </button>

      {/* Fechar */}
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
