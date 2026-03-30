import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-full min-h-dvh bg-background">
      {/* Sidebar — apenas desktop */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* TopBar — apenas mobile */}
        <TopBar />

        {/* Área de conteúdo scrollável */}
        <main className="flex-1 overflow-y-auto">
          {/* Padding bottom no mobile para não cobrir o BottomNav */}
          <div className="pb-24 md:pb-0">{children}</div>
        </main>
      </div>

      {/* BottomNav — apenas mobile */}
      <BottomNav />
    </div>
  );
}
