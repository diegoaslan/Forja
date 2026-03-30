import Link from "next/link";
import { ChevronRight, Target, Bell, Shield, HelpCircle, Star } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

const SHORTCUTS = [
  {
    group: "Preferências",
    items: [
      { icon: Target, label: "Metas e objetivos", desc: "Peso, calorias e macro alvos", href: "/settings" },
      { icon: Bell,   label: "Notificações",       desc: "Lembretes e alertas",          href: null },
    ],
  },
  {
    group: "Conta",
    items: [
      { icon: Shield,    label: "Privacidade e dados", desc: "Gerenciar suas informações",   href: null },
      { icon: Star,      label: "Forja Premium",       desc: "Recursos exclusivos em breve", href: null },
      { icon: HelpCircle,label: "Ajuda e suporte",     desc: "Dúvidas e tutoriais",          href: null },
    ],
  },
];

export function SettingsShortcutList() {
  return (
    <div className="mx-4 space-y-3">
      {SHORTCUTS.map((group) => (
        <div key={group.group} className="rounded-2xl bg-card card-shadow overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {group.group}
            </p>
          </div>
          <div className="divide-y divide-border">
            {group.items.map(({ icon: Icon, label, desc, href }) => {
              const inner = (
                <>
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </>
              );

              if (href) {
                return (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
                  >
                    {inner}
                  </Link>
                );
              }

              return (
                <button
                  key={label}
                  type="button"
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-muted/40 transition-colors opacity-60"
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="rounded-2xl bg-card card-shadow overflow-hidden">
        <LogoutButton />
      </div>
    </div>
  );
}
