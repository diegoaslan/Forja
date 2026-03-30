/**
 * Tipos e labels de progresso corporal — usados em toda a aplicação.
 * Os dados mockados foram removidos na ETAPA 5 (substituídos pelo Supabase).
 */

export interface WeightEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  weight: number;
  bodyFatPct?: number;
  note?: string;
}

export interface BodyMeasurements {
  id: string;
  date: string;
  waist?: number;   // cm
  chest?: number;
  arm?: number;
  thigh?: number;
  neck?: number;
  hip?: number;
}

export interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  bodyFatPct?: number;
  measurements?: Omit<BodyMeasurements, "id" | "date">;
  note?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  label?: string;
}

export interface BodyGoal {
  targetWeight: number;
  targetBodyFatPct?: number;
}

export const MEASUREMENT_LABELS: Record<
  keyof Omit<BodyMeasurements, "id" | "date">,
  string
> = {
  waist: "Cintura",
  chest: "Peito",
  arm: "Braço",
  thigh: "Coxa",
  neck: "Pescoço",
  hip: "Quadril",
};
