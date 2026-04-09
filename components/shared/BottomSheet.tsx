"use client";

/**
 * BottomSheet — overlay deslizante de baixo para cima.
 *
 * POR QUE createPortal?
 * O AppShell usa <main className="overflow-y-auto"> como scroll container.
 * No iOS Safari, `position: fixed` dentro de overflow:scroll/auto é clipado
 * ao bounds do container, não ao viewport — o backdrop não cobre a tela toda
 * e o painel aparece "cortado". createPortal move o sheet para document.body,
 * escapando de qualquer scroll container ancestral, garantindo que
 * `position: fixed` funcione corretamente em todos os browsers.
 *
 * ESTRUTURA DE FLEX SCROLL:
 * O painel usa `max-h-[90dvh] flex flex-col overflow-hidden`.
 * O overflow-hidden no pai é obrigatório: sem ele, o filho `flex-1 min-h-0`
 * com flex-basis:0 contribui 0px ao tamanho intrínseco do flex container,
 * resultando em scroll container de 0px de altura.
 */

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Texto simples: gera título + botão X no header. */
  title?: string;
  /**
   * Header customizado — renderizado fora do scroll container,
   * entre o handle bar e o conteúdo. Ideal para multi-step com botão
   * de voltar, ou qualquer header que não deve rolar com o conteúdo.
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
  // Fecha ao pressionar Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Trava scroll do body enquanto o sheet está aberto.
  // overflow:hidden é suficiente — o backdrop cobre o conteúdo, tornando
  // o scroll de background invisível ao usuário.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // createPortal: renderiza o sheet como filho direto de document.body,
  // fora de qualquer scroll container do app.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "w-full max-w-lg bg-card rounded-t-3xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          // overflow-hidden + flex flex-col + max-h: trio obrigatório para
          // que flex-1 no filho scrollável receba altura correta.
          "max-h-[90dvh] flex flex-col overflow-hidden",
          className
        )}
      >
        {/* Handle bar — indicador visual de drag */}
        <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header gerado automaticamente pelo prop title */}
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

        {/* Header customizado — fora do scroll, não some ao rolar */}
        {header}

        {/* Área de conteúdo rolável.
            pb-safe: padding na safe area do iPhone (home indicator).
            overscroll-contain: impede que o scroll vaze para o backdrop. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-safe">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
