-- ══════════════════════════════════════════════════════════════════
-- FORJA — Schema inicial
-- Versão: 20260329000000
-- ══════════════════════════════════════════════════════════════════

-- ── Extensões ─────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 1: PERFIL
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT,
  avatar_url       TEXT,
  -- Alinhado com UserGoal do app: cut | bulk | maintain | performance
  goal             TEXT        CHECK (goal IN ('cut', 'bulk', 'maintain', 'performance')),
  target_weight_kg NUMERIC(5,2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  profiles                IS 'Espelho de auth.users com dados extras do app.';
COMMENT ON COLUMN profiles.goal          IS 'cut | bulk | maintain | performance';
COMMENT ON COLUMN profiles.target_weight_kg IS 'Meta de peso em kg.';

-- Trigger: cria o profile automaticamente ao signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 2: TREINOS
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE muscle_groups (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

COMMENT ON TABLE muscle_groups IS 'Dados globais — somente leitura para usuários.';

CREATE TABLE exercises (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = exercício global (seed); UUID = criado pelo usuário
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  muscle_group_id  TEXT        REFERENCES muscle_groups(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN exercises.user_id IS 'NULL = global (seed). UUID = criado pelo usuário.';

CREATE TABLE workouts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  category          TEXT        NOT NULL DEFAULT 'full'
                    CHECK (category IN ('push','pull','legs','upper','lower','full','cardio')),
  description       TEXT,
  estimated_minutes INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE workout_exercises (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id        UUID         NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id       UUID         NOT NULL REFERENCES exercises(id),
  order_index       INT          NOT NULL,
  target_sets       INT          NOT NULL DEFAULT 3,
  -- '8-12' | 'AMRAP' | '5' — string livre como no app
  target_reps       TEXT         NOT NULL DEFAULT '8-12',
  rest_seconds      INT          NOT NULL DEFAULT 90,
  default_weight_kg NUMERIC(5,2),
  notes             TEXT,
  UNIQUE (workout_id, order_index)
);

CREATE TABLE workout_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- NULL se o treino for deletado depois da sessão
  workout_id       UUID        REFERENCES workouts(id) ON DELETE SET NULL,
  -- Snapshot do nome no momento da sessão
  workout_name     TEXT        NOT NULL,
  started_at       TIMESTAMPTZ NOT NULL,
  finished_at      TIMESTAMPTZ,
  elapsed_seconds  INT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_session_exercises (
  id             UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID  NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id    UUID  REFERENCES exercises(id) ON DELETE SET NULL,
  -- Snapshot do nome — histórico imutável
  exercise_name  TEXT  NOT NULL,
  order_index    INT   NOT NULL
);

CREATE TABLE workout_session_sets (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id  UUID         NOT NULL REFERENCES workout_session_exercises(id) ON DELETE CASCADE,
  set_index            INT          NOT NULL,
  target_reps          TEXT,
  actual_reps          INT,
  weight_kg            NUMERIC(5,2),
  completed            BOOLEAN      NOT NULL DEFAULT FALSE,
  completed_at         TIMESTAMPTZ,
  UNIQUE (session_exercise_id, set_index)
);

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 3: HÁBITOS
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE habits (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  icon          TEXT        NOT NULL DEFAULT '✓',
  category      TEXT        NOT NULL DEFAULT 'custom'
                CHECK (category IN ('health','fitness','mindset','custom')),
  -- NULL = todos os dias; array = dias específicos: '{mon,tue,wed}'
  target_days   TEXT[],
  target_count  INT,
  target_unit   TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order    INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN habits.target_days IS
  'NULL = diário. Array de dias: mon|tue|wed|thu|fri|sat|sun.';

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE habit_logs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE    NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  count       INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, date)
);

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 4: NUTRIÇÃO
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE nutrition_targets (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories        INT          NOT NULL CHECK (calories > 0),
  protein_g       NUMERIC(6,1) NOT NULL CHECK (protein_g >= 0),
  carbs_g         NUMERIC(6,1) NOT NULL CHECK (carbs_g >= 0),
  fats_g          NUMERIC(6,1) NOT NULL CHECK (fats_g >= 0),
  -- Vigente a partir desta data (permite histórico de metas)
  effective_from  DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN nutrition_targets.effective_from IS
  'Meta válida a partir desta data. Query: effective_from <= hoje ORDER BY DESC LIMIT 1.';

CREATE TABLE food_items (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL = item global (seed). UUID = criado pelo usuário
  user_id            UUID         REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT         NOT NULL,
  brand              TEXT,
  calories_per_100g  NUMERIC(6,1) NOT NULL CHECK (calories_per_100g >= 0),
  protein_per_100g   NUMERIC(6,1) NOT NULL CHECK (protein_per_100g >= 0),
  carbs_per_100g     NUMERIC(6,1) NOT NULL CHECK (carbs_per_100g >= 0),
  fats_per_100g      NUMERIC(6,1) NOT NULL CHECK (fats_per_100g >= 0),
  default_serving_g  NUMERIC(6,1),
  serving_desc       TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE meal_logs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE    NOT NULL,
  meal_type   TEXT    NOT NULL
              CHECK (meal_type IN ('breakfast','lunch','dinner','snack','pre','post')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date, meal_type)
);

CREATE TABLE meal_log_items (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id   UUID         NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
  food_item_id  UUID         NOT NULL REFERENCES food_items(id),
  quantity_g    NUMERIC(6,1) NOT NULL CHECK (quantity_g > 0),
  -- Snapshot dos macros no momento do log (histórico imutável)
  calories      INT          NOT NULL,
  protein_g     NUMERIC(6,1) NOT NULL,
  carbs_g       NUMERIC(6,1) NOT NULL,
  fats_g        NUMERIC(6,1) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 5: PROGRESSO CORPORAL
-- ══════════════════════════════════════════════════════════════════

-- Uma linha por dia (peso + medidas na mesma entrada)
CREATE TABLE body_metrics (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE         NOT NULL,
  weight_kg     NUMERIC(5,2),
  body_fat_pct  NUMERIC(4,1),
  waist_cm      NUMERIC(5,1),
  chest_cm      NUMERIC(5,1),
  arm_cm        NUMERIC(5,1),
  thigh_cm      NUMERIC(5,1),
  neck_cm       NUMERIC(5,1),
  hip_cm        NUMERIC(5,1),
  note          TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Fotos referenciam paths no Storage bucket 'progress-photos'
CREATE TABLE progress_photos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE        NOT NULL,
  -- path no bucket: '{user_id}/YYYY-MM-DD-{uuid}.jpg'
  storage_path  TEXT        NOT NULL,
  label         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 6: ÍNDICES DE PERFORMANCE
-- ══════════════════════════════════════════════════════════════════

-- Hábitos: consultas diárias e cálculo de streak
CREATE INDEX habit_logs_habit_date   ON habit_logs (habit_id, date DESC);
CREATE INDEX habit_logs_user_date    ON habit_logs (user_id, date DESC);
CREATE INDEX habits_user_active      ON habits (user_id) WHERE is_active = TRUE;

-- Nutrição: lookup diário
CREATE INDEX meal_logs_user_date     ON meal_logs (user_id, date DESC);
CREATE INDEX food_items_user         ON food_items (user_id NULLS FIRST);

-- Progresso: gráfico de peso e medidas
CREATE INDEX body_metrics_user_date  ON body_metrics (user_id, date DESC);
CREATE INDEX progress_photos_user    ON progress_photos (user_id, date DESC);

-- Treinos: histórico de sessões
CREATE INDEX workout_sessions_user   ON workout_sessions (user_id, started_at DESC);
CREATE INDEX workouts_user           ON workouts (user_id);

-- Metas nutricionais: meta vigente
CREATE INDEX nutrition_targets_user  ON nutrition_targets (user_id, effective_from DESC);

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 7: ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════

-- ── Padrão A: dados exclusivos do usuário ────────────────────────

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_sets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits                ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_targets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_log_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos       ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_owner" ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- workouts
CREATE POLICY "workouts_owner" ON workouts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- workout_exercises: acesso via workout do dono
CREATE POLICY "workout_exercises_owner" ON workout_exercises
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE user_id = auth.uid()
    )
  );

-- workout_sessions
CREATE POLICY "sessions_owner" ON workout_sessions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- workout_session_exercises: acesso via session do dono
CREATE POLICY "session_exercises_owner" ON workout_session_exercises
  USING (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  );

-- workout_session_sets: acesso via session_exercise → session do dono
CREATE POLICY "session_sets_owner" ON workout_session_sets
  USING (
    session_exercise_id IN (
      SELECT wse.id
      FROM workout_session_exercises wse
      JOIN workout_sessions ws ON ws.id = wse.session_id
      WHERE ws.user_id = auth.uid()
    )
  );

-- habits
CREATE POLICY "habits_owner" ON habits
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- habit_logs
CREATE POLICY "habit_logs_owner" ON habit_logs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- nutrition_targets
CREATE POLICY "nutrition_targets_owner" ON nutrition_targets
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- meal_logs
CREATE POLICY "meal_logs_owner" ON meal_logs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- meal_log_items: acesso via meal_log do dono
CREATE POLICY "meal_log_items_owner" ON meal_log_items
  USING (
    meal_log_id IN (
      SELECT id FROM meal_logs WHERE user_id = auth.uid()
    )
  );

-- body_metrics
CREATE POLICY "body_metrics_owner" ON body_metrics
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- progress_photos
CREATE POLICY "progress_photos_owner" ON progress_photos
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Padrão B: dados globais + dados do usuário ───────────────────

ALTER TABLE food_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises   ENABLE ROW LEVEL SECURITY;

-- food_items: leitura de itens globais + próprios
CREATE POLICY "food_items_read" ON food_items
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "food_items_insert" ON food_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_items_update" ON food_items
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "food_items_delete" ON food_items
  FOR DELETE USING (user_id = auth.uid());

-- exercises: mesma lógica de food_items
CREATE POLICY "exercises_read" ON exercises
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "exercises_insert" ON exercises
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "exercises_update" ON exercises
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "exercises_delete" ON exercises
  FOR DELETE USING (user_id = auth.uid());

-- ── Padrão C: somente leitura global ─────────────────────────────

ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "muscle_groups_read_all" ON muscle_groups
  FOR SELECT USING (true);
-- Escrita apenas via service_role (migrations/seed)

-- ══════════════════════════════════════════════════════════════════
-- BLOCO 8: STORAGE — criado via Supabase Dashboard ou CLI
-- (incluído aqui como referência; executar com service_role)
-- ══════════════════════════════════════════════════════════════════

/*
  -- Criar bucket privado para fotos de progresso
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'progress-photos',
    'progress-photos',
    false,
    5242880,  -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
  ON CONFLICT DO NOTHING;

  -- Policies de storage
  CREATE POLICY "storage_progress_select" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'progress-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "storage_progress_insert" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'progress-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "storage_progress_delete" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'progress-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
*/
