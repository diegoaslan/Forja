import Link from "next/link";
import { Dumbbell, Utensils, Scale, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  bg: string;
}

const actions: QuickAction[] = [
  {
    icon: Dumbbell,
    label: "Iniciar Treino",
    href: "/workouts",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Utensils,
    label: "Registrar Refeição",
    href: "/nutrition",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Scale,
    label: "Registrar Peso",
    href: "/progress",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Camera,
    label: "Foto de Progresso",
    href: "/progress",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold">Ações rápidas</h2>

      {/* Grid 2x2 no mobile, 4 colunas no desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl p-4 text-center",
                "transition-all active:scale-95",
                "border border-border/50 card-shadow hover:shadow-md",
                "bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  action.bg
                )}
              >
                <Icon
                  className={cn("h-5 w-5", action.color)}
                  strokeWidth={2}
                />
              </div>
              <span className="text-xs font-medium leading-tight text-foreground">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
