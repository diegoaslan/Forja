"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Flag, CheckCircle2 } from "lucide-react";
import { useWorkoutSession } from "@/store/workoutSessionStore";
import { ActiveExerciseCard } from "@/components/workouts/ActiveExerciseCard";
import { SessionProgressBar } from "@/components/workouts/SessionProgressBar";
import { RestTimer } from "@/components/workouts/RestTimer";
import { cn } from "@/lib/utils";
import type { Workout } from "@/lib/mock-workouts";
import { startWorkoutSession, finishWorkoutSession } from "@/lib/actions/workouts";
import type { FinishSessionExercise } from "@/lib/actions/workouts";

interface ActiveWorkoutSessionProps {
  workout: Workout;
}

export function ActiveWorkoutSession({ workout }: ActiveWorkoutSessionProps) {
  const router = useRouter();
  const initialized = useRef(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  // Força re-render a cada segundo para atualizar o display do timer
  const [, setTick] = useState(0);

  const {
    session,
    sessionDbId,
    initSession,
    setSessionDbId,
    resetSession,
    toggleSetComplete,
    updateSetReps,
    updateSetWeight,
    tickRest,
    dismissRest,
    finishSession,
    getTotalSets,
    getCompletedSets,
  } = useWorkoutSession();

  // Inicializa a sessão uma única vez e cria o registro no banco
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initSession(workout);

      // Fire-and-forget: cria workout_sessions no banco
      startWorkoutSession(workout.id, workout.name).then((dbId) => {
        if (dbId) setSessionDbId(dbId);
      });
    }
    return () => {
      // Não reseta no unmount — permite retornar à sessão
    };
  }, [workout, initSession, setSessionDbId]);

  // Tick a cada segundo: força re-render para atualizar o timer baseado em Date.now()
  // e avança o timer de descanso. O intervalo não conta segundos — apenas dispara
  // re-renders. Mesmo que o browser throttle o interval (tela apagada, background),
  // quando o usuário voltar ao app o tempo correto será exibido imediatamente.
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      // Lê estado diretamente do store (sem criar dependência no efeito)
      if (useWorkoutSession.getState().session?.rest.active) {
        tickRest();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tickRest]);

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Preparando treino...</p>
        </div>
      </div>
    );
  }

  // Tempo real decorrido calculado a partir do timestamp de início.
  // Robusto contra throttling do browser, re-renders e troca de tela.
  const elapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

  const totalSets = getTotalSets();
  const completedSets = getCompletedSets();
  const allDone = completedSets === totalSets && totalSets > 0;

  function buildFinishPayload(): FinishSessionExercise[] {
    if (!session) return [];
    return session.exercises.map((ex, exIdx) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.name,
      orderIndex: exIdx,
      sets: ex.sets.map((s) => ({
        setIndex: s.setNumber - 1,
        targetReps: String(s.targetReps),
        actualReps: s.actualReps,
        weightKg: s.weightKg,
        completed: s.completed,
        completedAt: s.completedAt,
      })),
    }));
  }

  function persistAndExit() {
    if (!session) return;

    // Calcula o tempo real decorrido no momento de finalizar (não usa contador)
    const finalElapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

    finishSession();

    // Fire-and-forget persistence — does not block navigation
    if (sessionDbId) {
      finishWorkoutSession(sessionDbId, finalElapsedSeconds, buildFinishPayload()).catch(
        (err) => {
          console.error("[ActiveWorkoutSession] falha ao persistir sessão:", err);
        }
      );
    }

    router.push("/workouts");
    setTimeout(() => resetSession(), 500);
  }

  function handleFinish() {
    if (allDone) {
      persistAndExit();
    } else {
      setShowFinishConfirm(true);
    }
  }

  function handleConfirmFinish() {
    persistAndExit();
  }

  function handleCancel() {
    resetSession();
    router.push(`/workouts/${workout.id}`);
  }

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* ── Header sticky ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          {/* Cancelar */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Nome + timer */}
          <div className="flex-1 min-w-0 text-center">
            <p className="text-sm font-semibold truncate">{session.workoutName}</p>
            <p className="text-xs font-mono text-muted-foreground">
              {formatElapsed(elapsedSeconds)}
            </p>
          </div>

          {/* Finalizar */}
          <button
            type="button"
            onClick={handleFinish}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 h-9 text-sm font-semibold shrink-0 transition-colors",
              allDone
                ? "bg-green-500 text-white"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {allDone ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Concluir
              </>
            ) : (
              <>
                <Flag className="h-4 w-4" />
                Encerrar
              </>
            )}
          </button>
        </div>

        {/* Barra de progresso */}
        <SessionProgressBar
          completedSets={completedSets}
          totalSets={totalSets}
          elapsedSeconds={elapsedSeconds}
        />
      </header>

      {/* ── Lista de exercícios ──────────────────────────────────── */}
      <main
        className={cn(
          "flex-1 overflow-y-auto px-4 py-4 space-y-3",
          session.rest.active && "pb-28" // espaço para o RestTimer
        )}
      >
        {session.exercises.map((exercise, exIdx) => (
          <ActiveExerciseCard
            key={exercise.workoutExerciseId}
            exercise={exercise}
            exerciseIndex={exIdx}
            isFirst={exIdx === 0}
            onToggleSet={toggleSetComplete}
            onUpdateReps={updateSetReps}
            onUpdateWeight={updateSetWeight}
          />
        ))}

        {/* Padding extra no final para não cobrir o RestTimer */}
        <div className="h-4" />
      </main>

      {/* ── Rest Timer (fixed bottom) ────────────────────────────── */}
      {session.rest.active && (
        <RestTimer
          secondsLeft={session.rest.secondsLeft}
          totalSeconds={session.rest.totalSeconds}
          onDismiss={dismissRest}
        />
      )}

      {/* ── Modal de confirmação para encerrar antes de terminar ── */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card rounded-3xl shadow-xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-amber-50 mx-auto">
                <Flag className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold">Encerrar treino?</h3>
              <p className="text-sm text-muted-foreground">
                Você completou {completedSets} de {totalSets} séries.
                O treino será registrado com o progresso atual.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-colors hover:bg-primary/90"
              >
                Sim, encerrar
              </button>
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-muted text-foreground font-medium text-sm transition-colors hover:bg-muted/70"
              >
                Continuar treino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
