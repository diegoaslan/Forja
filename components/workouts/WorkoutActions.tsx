"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { deleteWorkout } from "@/lib/actions/workouts";
import { EditWorkoutSheet } from "./EditWorkoutSheet";
import type { Workout } from "@/lib/mock-workouts";

interface WorkoutActionsProps {
  workout: Workout;
}

export function WorkoutActions({ workout }: WorkoutActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const result = await deleteWorkout(workout.id);
    setDeleting(false);
    if (result.error) {
      setDeleteError(result.error);
      return;
    }
    router.push("/workouts");
  }

  return (
    <>
      {/* Botões de ação */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </button>
      </div>

      {/* Dialog de confirmação de exclusão — portal para escapar do scroll container */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Excluir treino?</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{workout.name}</span> será removido permanentemente.
                O histórico de sessões já realizadas não será afetado.
              </p>
            </div>

            {deleteError && (
              <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl bg-muted text-sm font-semibold hover:bg-muted/70 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 h-11 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sheet de edição */}
      <EditWorkoutSheet
        workout={workout}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
