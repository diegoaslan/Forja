import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  initials: string;
  memberSince?: string;
  currentStreak: number;
  workoutsThisWeek: number;
  habitCompletionPct: number;
}

export function ProfileHeader({
  fullName,
  email,
  initials,
  memberSince,
  currentStreak,
  workoutsThisWeek,
  habitCompletionPct,
}: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient banner */}
      <div className="gradient-primary h-28 w-full" />

      {/* Avatar overlapping banner */}
      <div className="px-4 pb-4">
        <div className="-mt-10 flex items-end justify-between">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg shrink-0">
            <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="mb-1 flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
            <span className="text-base">🔥</span>
            <span className="text-xs font-semibold">{currentStreak} dias</span>
          </div>
        </div>

        {/* Name + email */}
        <div className="mt-3">
          <h1 className="text-xl font-bold leading-tight truncate">{fullName}</h1>
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          {memberSince && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Membro desde {memberSince}
            </p>
          )}
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { value: `${workoutsThisWeek}x`, label: "Esta semana"   },
            { value: `${currentStreak}`,      label: "Dias de streak" },
            { value: `${habitCompletionPct}%`, label: "Hábitos"      },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-muted/60 px-3 py-2.5 text-center">
              <p className="text-lg font-bold leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
