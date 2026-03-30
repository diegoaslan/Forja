import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAnalyticsData } from "@/lib/actions/analytics";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserGoalsCard } from "@/components/profile/UserGoalsCard";
import { SettingsShortcutList } from "@/components/profile/SettingsShortcutList";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const email = user?.email ?? "";

  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : undefined;

  const analytics = await getAnalyticsData();

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] md:min-h-screen pb-24 md:pb-8">
      <div className="max-w-lg mx-auto md:max-w-2xl w-full space-y-4">
        {/* Profile hero — banner + avatar + quick stats */}
        <ProfileHeader
          fullName={fullName}
          email={email}
          initials={initials}
          memberSince={memberSince}
          currentStreak={analytics.currentStreak}
          workoutsThisWeek={analytics.workoutsThisWeek}
          habitCompletionPct={analytics.habitCompletionPct}
        />

        {/* Active goals summary */}
        <UserGoalsCard
          currentWeight={analytics.currentWeight}
          weightGoal={analytics.weightGoal}
          weightToGoal={analytics.weightToGoal}
          workoutsThisWeek={analytics.workoutsThisWeek}
          caloriesTarget={analytics.caloriesTarget}
          proteinTarget={analytics.proteinTarget}
          dietAdherencePct={analytics.dietAdherencePct}
        />

        {/* Settings shortcuts + logout */}
        <SettingsShortcutList />

        {/* App version footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Forja v0.1
        </p>
      </div>
    </div>
  );
}
