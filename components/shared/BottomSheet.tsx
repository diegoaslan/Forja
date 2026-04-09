"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Texto simples no header — gera título + botão X automaticamente. */
  title?: string;
  /**
   * Header customizado (ReactNode). Renderizado fora do scroll container,
   * entre o handle bar e o conteúdo rolável. Use isso quando precisar de
   * botão de voltar, multi-step, ou qualquer header que não deve rolar.
   */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  header,
  children,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  // Guarda a posição do scroll do body para restaurar ao fechar (iOS fix)
  const savedScrollY = useRef(0);

  // Fecha ao clicar fora do painel
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Fecha no Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Body scroll lock — compatível com iOS Safari.
  // Usa position:fixed no body para evitar o bug do iOS onde
  // overflow:hidden não impede scroll por toque.
  useEffect(() => {
    if (open) {
      savedScrollY.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll"; // evita layout shift pela scrollbar
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, savedScrollY.current);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div
        ref={sheetRef}
        className={cn(
          // overflow-hidden é obrigatório: sem ele, flex-1 no filho scrollável
          // fica com 0px de altura porque o pai não tem altura definida — só
          // max-height. Com overflow-hidden, o navegador corretamente distribui
          // o espaço restante para o filho flex-1.
          "w-full max-w-lg bg-card rounded-t-3xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          "max-h-[90dvh] flex flex-col overflow-hidden",
          className
        )}
      >
        {/* Handle bar */}
        <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header gerado pelo prop title (com botão X) */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header customizado (fora do scroll — não rola com o conteúdo) */}
        {header}

        {/* Área de conteúdo rolável.
            flex-1 + min-h-0 + overflow-y-auto: padrão correto para scroll
            dentro de flex column. O overflow-hidden no pai garante que o
            flex-1 receba a altura restante corretamente. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
