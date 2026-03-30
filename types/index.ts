export type { Database, Profile, Tables, TablesInsert, TablesUpdate } from "./database";

// ── Tipos de estado para Server Actions ─────────────────────────

export interface ActionState {
  error?: string;
  success?: string;
}

// ── Metas do usuário ─────────────────────────────────────────────

export type UserGoal = "cut" | "bulk" | "maintain" | "performance";

export const USER_GOAL_LABELS: Record<UserGoal, string> = {
  cut: "Perda de peso",
  bulk: "Ganho de massa",
  maintain: "Manutenção",
  performance: "Performance",
};
