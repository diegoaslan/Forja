/**
 * Tipos do schema Forja — ETAPA 4.1.
 *
 * Estrutura equivalente ao output de `supabase gen types typescript`.
 * Quando o projeto estiver no Supabase Cloud, substitua este arquivo com:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 *
 * Compatibilidade com ETAPA 3:
 *   - Tables<"profiles">     → mantido, campos expandidos
 *   - TablesInsert / TablesUpdate → mantidos
 *   - Profile                → mantido
 *   - email removido de profiles.Row (nunca estava no banco — vem de auth.users)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Tipo auxiliar: valores de goal alinhados com UserGoal ────────

export type UserGoalValue = "cut" | "bulk" | "maintain" | "performance";

// ── Database ──────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {

      // ── profiles ───────────────────────────────────────────────
      profiles: {
        Row: {
          id:                string;
          full_name:         string | null;
          avatar_url:        string | null;
          goal:              UserGoalValue | null;
          target_weight_kg:  number | null;
          created_at:        string;
          updated_at:        string;
        };
        Insert: {
          id:                string;
          full_name?:        string | null;
          avatar_url?:       string | null;
          goal?:             UserGoalValue | null;
          target_weight_kg?: number | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: {
          id?:               string;
          full_name?:        string | null;
          avatar_url?:       string | null;
          goal?:             UserGoalValue | null;
          target_weight_kg?: number | null;
          updated_at?:       string;
        };
        Relationships: [];
      };

      // ── muscle_groups ──────────────────────────────────────────
      muscle_groups: {
        Row:    { id: string; name: string };
        Insert: { id: string; name: string };
        Update: { id?: string; name?: string };
        Relationships: [];
      };

      // ── exercises ──────────────────────────────────────────────
      exercises: {
        Row: {
          id:               string;
          user_id:          string | null;
          name:             string;
          muscle_group_id:  string | null;
          created_at:       string;
        };
        Insert: {
          id?:              string;
          user_id?:         string | null;
          name:             string;
          muscle_group_id?: string | null;
          created_at?:      string;
        };
        Update: {
          id?:              string;
          user_id?:         string | null;
          name?:            string;
          muscle_group_id?: string | null;
        };
        Relationships: [];
      };

      // ── workouts ───────────────────────────────────────────────
      workouts: {
        Row: {
          id:                 string;
          user_id:            string;
          name:               string;
          category:           "push" | "pull" | "legs" | "upper" | "lower" | "full" | "cardio";
          description:        string | null;
          estimated_minutes:  number | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: {
          id?:                string;
          user_id:            string;
          name:               string;
          category?:          "push" | "pull" | "legs" | "upper" | "lower" | "full" | "cardio";
          description?:       string | null;
          estimated_minutes?: number | null;
          created_at?:        string;
          updated_at?:        string;
        };
        Update: {
          id?:                string;
          name?:              string;
          category?:          "push" | "pull" | "legs" | "upper" | "lower" | "full" | "cardio";
          description?:       string | null;
          estimated_minutes?: number | null;
          updated_at?:        string;
        };
        Relationships: [];
      };

      // ── workout_exercises ──────────────────────────────────────
      workout_exercises: {
        Row: {
          id:                 string;
          workout_id:         string;
          exercise_id:        string;
          order_index:        number;
          target_sets:        number;
          target_reps:        string;
          rest_seconds:       number;
          default_weight_kg:  number | null;
          notes:              string | null;
        };
        Insert: {
          id?:                string;
          workout_id:         string;
          exercise_id:        string;
          order_index:        number;
          target_sets?:       number;
          target_reps?:       string;
          rest_seconds?:      number;
          default_weight_kg?: number | null;
          notes?:             string | null;
        };
        Update: {
          order_index?:       number;
          target_sets?:       number;
          target_reps?:       string;
          rest_seconds?:      number;
          default_weight_kg?: number | null;
          notes?:             string | null;
        };
        Relationships: [];
      };

      // ── workout_sessions ───────────────────────────────────────
      workout_sessions: {
        Row: {
          id:               string;
          user_id:          string;
          workout_id:       string | null;
          workout_name:     string;
          started_at:       string;
          finished_at:      string | null;
          elapsed_seconds:  number | null;
          notes:            string | null;
          created_at:       string;
        };
        Insert: {
          id?:              string;
          user_id:          string;
          workout_id?:      string | null;
          workout_name:     string;
          started_at:       string;
          finished_at?:     string | null;
          elapsed_seconds?: number | null;
          notes?:           string | null;
          created_at?:      string;
        };
        Update: {
          finished_at?:     string | null;
          elapsed_seconds?: number | null;
          notes?:           string | null;
        };
        Relationships: [];
      };

      // ── workout_session_exercises ──────────────────────────────
      workout_session_exercises: {
        Row: {
          id:             string;
          session_id:     string;
          exercise_id:    string | null;
          exercise_name:  string;
          order_index:    number;
        };
        Insert: {
          id?:            string;
          session_id:     string;
          exercise_id?:   string | null;
          exercise_name:  string;
          order_index:    number;
        };
        Update: {
          exercise_name?: string;
          order_index?:   number;
        };
        Relationships: [];
      };

      // ── workout_session_sets ───────────────────────────────────
      workout_session_sets: {
        Row: {
          id:                   string;
          session_exercise_id:  string;
          set_index:            number;
          target_reps:          string | null;
          actual_reps:          number | null;
          weight_kg:            number | null;
          completed:            boolean;
          completed_at:         string | null;
        };
        Insert: {
          id?:                  string;
          session_exercise_id:  string;
          set_index:            number;
          target_reps?:         string | null;
          actual_reps?:         number | null;
          weight_kg?:           number | null;
          completed?:           boolean;
          completed_at?:        string | null;
        };
        Update: {
          actual_reps?:  number | null;
          weight_kg?:    number | null;
          completed?:    boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };

      // ── habits ─────────────────────────────────────────────────
      habits: {
        Row: {
          id:            string;
          user_id:       string;
          name:          string;
          icon:          string;
          category:      "health" | "fitness" | "mindset" | "custom";
          /** null = todos os dias; string[] = dias específicos */
          target_days:   string[] | null;
          target_count:  number | null;
          target_unit:   string | null;
          is_active:     boolean;
          sort_order:    number;
          created_at:    string;
          updated_at:    string;
        };
        Insert: {
          id?:           string;
          user_id:       string;
          name:          string;
          icon?:         string;
          category?:     "health" | "fitness" | "mindset" | "custom";
          target_days?:  string[] | null;
          target_count?: number | null;
          target_unit?:  string | null;
          is_active?:    boolean;
          sort_order?:   number;
          created_at?:   string;
          updated_at?:   string;
        };
        Update: {
          name?:         string;
          icon?:         string;
          category?:     "health" | "fitness" | "mindset" | "custom";
          target_days?:  string[] | null;
          target_count?: number | null;
          target_unit?:  string | null;
          is_active?:    boolean;
          sort_order?:   number;
          updated_at?:   string;
        };
        Relationships: [];
      };

      // ── habit_logs ─────────────────────────────────────────────
      habit_logs: {
        Row: {
          id:          string;
          habit_id:    string;
          user_id:     string;
          date:        string;   // DATE → "YYYY-MM-DD"
          completed:   boolean;
          count:       number | null;
          created_at:  string;
        };
        Insert: {
          id?:         string;
          habit_id:    string;
          user_id:     string;
          date:        string;
          completed?:  boolean;
          count?:      number | null;
          created_at?: string;
        };
        Update: {
          completed?:  boolean;
          count?:      number | null;
        };
        Relationships: [];
      };

      // ── nutrition_targets ──────────────────────────────────────
      nutrition_targets: {
        Row: {
          id:              string;
          user_id:         string;
          calories:        number;
          protein_g:       number;
          carbs_g:         number;
          fats_g:          number;
          effective_from:  string;  // DATE
          created_at:      string;
        };
        Insert: {
          id?:             string;
          user_id:         string;
          calories:        number;
          protein_g:       number;
          carbs_g:         number;
          fats_g:          number;
          effective_from?: string;
          created_at?:     string;
        };
        Update: {
          calories?:       number;
          protein_g?:      number;
          carbs_g?:        number;
          fats_g?:         number;
          effective_from?: string;
        };
        Relationships: [];
      };

      // ── food_items ─────────────────────────────────────────────
      food_items: {
        Row: {
          id:                  string;
          user_id:             string | null;
          name:                string;
          brand:               string | null;
          calories_per_100g:   number;
          protein_per_100g:    number;
          carbs_per_100g:      number;
          fats_per_100g:       number;
          default_serving_g:   number | null;
          serving_desc:        string | null;
          created_at:          string;
        };
        Insert: {
          id?:                 string;
          user_id?:            string | null;
          name:                string;
          brand?:              string | null;
          calories_per_100g:   number;
          protein_per_100g:    number;
          carbs_per_100g:      number;
          fats_per_100g:       number;
          default_serving_g?:  number | null;
          serving_desc?:       string | null;
          created_at?:         string;
        };
        Update: {
          name?:               string;
          brand?:              string | null;
          calories_per_100g?:  number;
          protein_per_100g?:   number;
          carbs_per_100g?:     number;
          fats_per_100g?:      number;
          default_serving_g?:  number | null;
          serving_desc?:       string | null;
        };
        Relationships: [];
      };

      // ── meal_logs ──────────────────────────────────────────────
      meal_logs: {
        Row: {
          id:          string;
          user_id:     string;
          date:        string;  // DATE
          meal_type:   "breakfast" | "lunch" | "dinner" | "snack" | "pre" | "post";
          created_at:  string;
        };
        Insert: {
          id?:         string;
          user_id:     string;
          date:        string;
          meal_type:   "breakfast" | "lunch" | "dinner" | "snack" | "pre" | "post";
          created_at?: string;
        };
        Update: {
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | "pre" | "post";
        };
        Relationships: [];
      };

      // ── meal_log_items ─────────────────────────────────────────
      meal_log_items: {
        Row: {
          id:            string;
          meal_log_id:   string;
          food_item_id:  string;
          quantity_g:    number;
          calories:      number;
          protein_g:     number;
          carbs_g:       number;
          fats_g:        number;
          created_at:    string;
        };
        Insert: {
          id?:           string;
          meal_log_id:   string;
          food_item_id:  string;
          quantity_g:    number;
          calories:      number;
          protein_g:     number;
          carbs_g:       number;
          fats_g:        number;
          created_at?:   string;
        };
        Update: {
          quantity_g?: number;
          calories?:   number;
          protein_g?:  number;
          carbs_g?:    number;
          fats_g?:     number;
        };
        Relationships: [];
      };

      // ── body_metrics ───────────────────────────────────────────
      body_metrics: {
        Row: {
          id:            string;
          user_id:       string;
          date:          string;  // DATE
          weight_kg:     number | null;
          body_fat_pct:  number | null;
          waist_cm:      number | null;
          chest_cm:      number | null;
          arm_cm:        number | null;
          thigh_cm:      number | null;
          neck_cm:       number | null;
          hip_cm:        number | null;
          note:          string | null;
          created_at:    string;
        };
        Insert: {
          id?:           string;
          user_id:       string;
          date:          string;
          weight_kg?:    number | null;
          body_fat_pct?: number | null;
          waist_cm?:     number | null;
          chest_cm?:     number | null;
          arm_cm?:       number | null;
          thigh_cm?:     number | null;
          neck_cm?:      number | null;
          hip_cm?:       number | null;
          note?:         string | null;
          created_at?:   string;
        };
        Update: {
          weight_kg?:    number | null;
          body_fat_pct?: number | null;
          waist_cm?:     number | null;
          chest_cm?:     number | null;
          arm_cm?:       number | null;
          thigh_cm?:     number | null;
          neck_cm?:      number | null;
          hip_cm?:       number | null;
          note?:         string | null;
        };
        Relationships: [];
      };

      // ── progress_photos ────────────────────────────────────────
      progress_photos: {
        Row: {
          id:            string;
          user_id:       string;
          date:          string;  // DATE
          storage_path:  string;
          label:         string | null;
          created_at:    string;
        };
        Insert: {
          id?:           string;
          user_id:       string;
          date:          string;
          storage_path:  string;
          label?:        string | null;
          created_at?:   string;
        };
        Update: {
          label?:        string | null;
          storage_path?: string;
        };
        Relationships: [];
      };

    }; // end Tables

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ── Helpers de conveniência (mantidos da ETAPA 2) ─────────────────

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ── Tipos concretos (mantidos + expandidos) ───────────────────────

export type Profile         = Tables<"profiles">;
export type Habit           = Tables<"habits">;
export type HabitLog        = Tables<"habit_logs">;
export type BodyMetric      = Tables<"body_metrics">;
export type ProgressPhoto   = Tables<"progress_photos">;
export type FoodItem        = Tables<"food_items">;
export type MealLog         = Tables<"meal_logs">;
export type MealLogItem     = Tables<"meal_log_items">;
export type NutritionTarget = Tables<"nutrition_targets">;
export type DbWorkout       = Tables<"workouts">;
export type DbExercise      = Tables<"exercises">;
export type WorkoutSession  = Tables<"workout_sessions">;

// ── Nota de compatibilidade ───────────────────────────────────────
//
// profiles.email foi removido: e-mail vem de auth.getUser(), não do banco.
// Se algum código acessar Profile["email"], resultará em erro de compilação
// intencional — use `user.email` da sessão Supabase.
//
// target_days: string[] | null no banco
//   null  → o hábito aplica-se a todos os dias
//   array → lista de dias: ["mon","tue","wed"]
// Adapter para o tipo do app (Weekday[] | "daily"):
//   db: null          → app: "daily"
//   db: ["mon","tue"] → app: ["mon","tue"]
