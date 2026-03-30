/**
 * Tipos de hábitos — usados em toda a aplicação.
 * Os dados mockados foram removidos na ETAPA 5 (substituídos pelo Supabase).
 */

export type HabitCategory = "health" | "fitness" | "mindset" | "custom";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  /** "daily" ou lista de dias da semana */
  targetDays: Weekday[] | "daily";
  /** Meta numérica opcional (ex: "8 copos") */
  targetCount?: number;
  targetUnit?: string;
}

export interface HabitLog {
  habitId: string;
  /** YYYY-MM-DD */
  date: string;
  completed: boolean;
  count?: number;
}
