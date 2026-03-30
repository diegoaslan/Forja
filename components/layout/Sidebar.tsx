"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Dumbbell,
  Utensils,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Settings,
  Flame,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

const navItems = [
  { label: "Home",      href: "/home",      icon: Home        },
  { label: "Treinos",   href: "/workouts",  icon: Dumbbell    },
  { label: "Dieta",     href: "/nutrition", icon: Utensils    },
  { label: "Hábitos",   href: "/habits",    icon: CheckSquare },
  { label: "Progresso", href: "/progress",  icon: TrendingUp  },
  { label: "Analytics", href: "/analytics", icon: BarChart3   },
];

const bottomItems = [
  { label: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const fullName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Usuário";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm">
          <Flame className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight">Forja</span>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scroll-hidden">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className="h-4.5 w-4.5 shrink-0"
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Rodapé: config + usuário */}
      <div className="border-t border-border px-3 pt-3 pb-4 space-y-0.5">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}

        {/* Perfil do usuário */}
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors mt-1"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="gradient-primary text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
