import { Flame } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header simples com logo */}
      <header className="flex items-center justify-center py-8 pt-safe">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm">
            <Flame className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Forja</span>
        </div>
      </header>

      {/* Conteúdo da página de auth */}
      <main className="flex flex-1 flex-col items-center justify-start px-4 pb-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
