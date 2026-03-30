"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors rounded-b-xl text-destructive disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin" strokeWidth={1.8} />
      ) : (
        <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.8} />
      )}
      <span className="flex-1 text-sm font-medium">
        {isPending ? "Saindo..." : "Sair"}
      </span>
    </button>
  );
}
