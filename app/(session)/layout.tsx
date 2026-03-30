/**
 * Layout da sessão ativa — modo focado sem BottomNav nem Sidebar.
 * Envolve apenas as rotas /workouts/start/[id].
 */
export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {children}
    </div>
  );
}
