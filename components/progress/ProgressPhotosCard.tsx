"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { saveProgressPhotoRecord } from "@/lib/actions/progress";
import { useProgressStore } from "@/store/progressStore";
import type { ProgressPhotoWithUrl } from "@/lib/actions/progress";

// ── Photo slot (filled) ───────────────────────────────────────────

function PhotoSlot({ photo }: { photo: ProgressPhotoWithUrl }) {
  const date = new Date(photo.date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="aspect-[3/4] rounded-2xl overflow-hidden relative bg-muted">
        {photo.url ? (
          // Real photo from Storage
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.label ?? date}
            className="w-full h-full object-cover"
          />
        ) : (
          // Placeholder (no URL available — bucket not configured or URL expired)
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-muted to-muted/60">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="text-5xl">👤</div>
            </div>
            <Camera className="h-5 w-5 text-muted-foreground relative z-10" />
          </div>
        )}
        {photo.label && (
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full whitespace-nowrap">
            {photo.label}
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">{date}</p>
    </div>
  );
}

// ── Empty slot (upload trigger) ───────────────────────────────────

function EmptySlot({
  onUpload,
  uploading,
}: {
  onUpload: () => void;
  uploading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onUpload}
      disabled={uploading}
      className="flex flex-col gap-1.5 group"
    >
      <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1.5 group-hover:border-primary/40 group-hover:bg-primary/4 transition-colors disabled:opacity-50">
        {uploading ? (
          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        ) : (
          <>
            <Camera className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
            <span className="text-[10px] text-muted-foreground/60 group-hover:text-primary/60 transition-colors">
              Adicionar
            </span>
          </>
        )}
      </div>
      <p className="text-[10px] text-transparent">–</p>
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────

interface ProgressPhotosCardProps {
  photos: ProgressPhotoWithUrl[];
}

export function ProgressPhotosCard({ photos }: ProgressPhotosCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onPhotoSaved = useProgressStore((s) => s.onPhotoSaved);

  const slots = [...photos].slice(0, 3);
  const emptyCount = Math.max(0, 3 - slots.length);

  function triggerPicker() {
    setError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again later
    e.target.value = "";

    if (file.size > 5 * 1024 * 1024) {
      setError("Foto deve ter no máximo 5 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const date = new Date().toISOString().slice(0, 10);
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${date}-${crypto.randomUUID()}.${ext}`;

      // Upload to Supabase Storage (browser client — avoids serializing File)
      const { error: uploadErr } = await supabase.storage
        .from("progress-photos")
        .upload(path, file, { contentType: file.type });

      if (uploadErr) throw new Error(uploadErr.message);

      // Get a short-lived signed URL to display immediately
      const { data: signed } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(path, 3600);

      // Save the DB record via server action
      const saved = await saveProgressPhotoRecord(path, date, undefined);
      if (!saved) throw new Error("Falha ao salvar registro.");

      onPhotoSaved({
        id: saved.id,
        date: saved.date,
        label: saved.label,
        storagePath: saved.storagePath,
        url: signed?.signedUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-4 rounded-2xl bg-card card-shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Fotos de progresso
        </p>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={triggerPicker}
            disabled={uploading}
            className="text-xs font-semibold text-primary hover:opacity-75 transition-opacity disabled:opacity-40"
          >
            + Nova
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-rose-500 mb-2">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {slots.map((photo) => (
          <PhotoSlot key={photo.id} photo={photo} />
        ))}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <EmptySlot
            key={`empty-${i}`}
            onUpload={triggerPicker}
            uploading={uploading && i === 0}
          />
        ))}
      </div>
    </div>
  );
}
