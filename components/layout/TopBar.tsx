"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Flame, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/home":       "Forja",
  "/workouts":   "Treinos",
  "/nutrition":  "Dieta",
  "/habits":     "Hábitos",
  "/progress":   "Progresso",
  "/analytics":  "Analytics",
  "/profile":    "Perfil",
  "/settings":   "Configurações",
  "/exercises":  "Exercícios",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const parent = "/" + pathname.split("/").filter(Boolean)[0];
  return pageTitles[parent] ?? "";
}

function getParentPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 1 ? "/" + segments[0] : null;
}

export function TopBar() {
  const pathname = usePathname();
  const isHome = pathname === "/home";
  const parentPath = getParentPath(pathname);
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-card/95 backdrop-blur-md md:hidden pt-safe">
      <div className="flex w-full items-center gap-2 px-4">
        {/* Botão de voltar — rotas aninhadas */}
        {parentPath ? (
          <Link
            href={parentPath}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
        ) : null}

        {/* Logo (home) ou título (outras páginas) */}
        <div className="flex-1 min-w-0">
          {isHome ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-sm">
                <Flame className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight">Forja</span>
            </div>
          ) : (
            <h1 className="text-base font-semibold truncate">{title}</h1>
          )}
        </div>

        {/* Ação do lado direito */}
        {isHome && (
          <button className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            "hover:bg-muted transition-colors relative"
          )}>
            <Bell className="h-5 w-5" strokeWidth={1.8} />
            {/* Badge de notificação — placeholder */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        )}
      </div>
    </header>
  );
}
