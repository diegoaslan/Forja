/**
 * Dados mockados centralizados — usados até ETAPA 4 (banco real).
 * Estrutura idêntica à que virá do Supabase para facilitar a troca.
 */

// ── Checklist diário ─────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  label: string;
  icon: string;
  category: "health" | "fitness" | "nutrition" | "mindset" | "progress";
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "water",   label: "Beber água",        icon: "💧", category: "health"    },
  { id: "workout", label: "Treino",             icon: "💪", category: "fitness"   },
  { id: "diet",    label: "Seguir dieta",       icon: "🥗", category: "nutrition" },
  { id: "reading", label: "Leitura 30min",      icon: "📖", category: "mindset"   },
  { id: "cardio",  label: "Cardio / passos",    icon: "🏃", category: "fitness"   },
  { id: "photo",   label: "Foto de progresso",  icon: "📸", category: "progress"  },
  { id: "sleep",   label: "Dormir bem (8h)",    icon: "😴", category: "health"    },
];

// IDs marcados como concluídos hoje
export const MOCK_COMPLETED_TODAY: string[] = ["water", "workout"];

// ── Treino ───────────────────────────────────────────────────────

export type WorkoutStatus = "completed" | "scheduled" | "rest_day";

export interface MockWorkout {
  name: string;
  category: string;
  status: WorkoutStatus;
  durationMinutes: number;
  exercisesCount: number;
  setsTotal: number;
}

export const MOCK_TODAY_WORKOUT: MockWorkout = {
  name: "Push Day A",
  category: "push",
  status: "completed",
  durationMinutes: 48,
  exercisesCount: 6,
  setsTotal: 18,
};

// ── Nutrição ─────────────────────────────────────────────────────

export interface MacroItem {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export interface MockNutrition {
  calories: { current: number; target: number };
  macros: MacroItem[];
}

export const MOCK_NUTRITION: MockNutrition = {
  calories: { current: 1840, target: 2200 },
  macros: [
    { label: "Proteína",    current: 142, target: 180, unit: "g", color: "bg-blue-500"  },
    { label: "Carboidrato", current: 220, target: 250, unit: "g", color: "bg-amber-500" },
    { label: "Gordura",     current: 55,  target: 65,  unit: "g", color: "bg-rose-500"  },
  ],
};

// ── Streak e progresso ───────────────────────────────────────────

export interface MockStreak {
  current: number;
  best: number;
  weeklyDone: boolean[]; // dom → sab
}

export const MOCK_STREAK: MockStreak = {
  current: 12,
  best: 21,
  weeklyDone: [true, true, true, true, true, false, false],
};

// ── Peso ─────────────────────────────────────────────────────────

export interface MockWeight {
  current: number;
  previous: number; // último registro antes do atual
  goal: number;
  unit: "kg";
}

export const MOCK_WEIGHT: MockWeight = {
  current: 82.4,
  previous: 82.9,
  goal: 78.0,
  unit: "kg",
};

// ── Usuário (preview) ────────────────────────────────────────────

export const MOCK_USER = {
  firstName: "Diego",
  goal: "cut" as const,
};
