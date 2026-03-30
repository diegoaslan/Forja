-- ══════════════════════════════════════════════════════════════════
-- FORJA — Seed de desenvolvimento
-- Executar com: supabase db seed  (ou pelo Dashboard > SQL Editor)
-- Não depende de nenhum user_id — dados globais apenas.
-- ══════════════════════════════════════════════════════════════════

-- ── Grupos musculares ─────────────────────────────────────────────

INSERT INTO muscle_groups (id, name) VALUES
  ('chest',     'Peito'),
  ('back',      'Costas'),
  ('shoulders', 'Ombros'),
  ('biceps',    'Bíceps'),
  ('triceps',   'Tríceps'),
  ('legs',      'Pernas'),
  ('glutes',    'Glúteos'),
  ('core',      'Core'),
  ('calves',    'Panturrilha')
ON CONFLICT (id) DO NOTHING;

-- ── Exercícios globais ────────────────────────────────────────────
-- Mirrors EX object from lib/mock-workouts.ts

INSERT INTO exercises (id, user_id, name, muscle_group_id) VALUES
  ('00000000-0000-0000-0001-000000000001', NULL, 'Supino Reto',            'chest'),
  ('00000000-0000-0000-0001-000000000002', NULL, 'Supino Inclinado DB',    'chest'),
  ('00000000-0000-0000-0001-000000000003', NULL, 'Cross-over',             'chest'),
  ('00000000-0000-0000-0001-000000000004', NULL, 'Desenvolvimento',        'shoulders'),
  ('00000000-0000-0000-0001-000000000005', NULL, 'Elevação Lateral',       'shoulders'),
  ('00000000-0000-0000-0001-000000000006', NULL, 'Tríceps Pulley',         'triceps'),
  ('00000000-0000-0000-0001-000000000007', NULL, 'Tríceps Corda',          'triceps'),
  ('00000000-0000-0000-0001-000000000008', NULL, 'Barra Fixa',             'back'),
  ('00000000-0000-0000-0001-000000000009', NULL, 'Remada Curvada',         'back'),
  ('00000000-0000-0000-0001-000000000010', NULL, 'Pulldown',               'back'),
  ('00000000-0000-0000-0001-000000000011', NULL, 'Remada Unilateral',      'back'),
  ('00000000-0000-0000-0001-000000000012', NULL, 'Rosca Direta',           'biceps'),
  ('00000000-0000-0000-0001-000000000013', NULL, 'Rosca Martelo',          'biceps'),
  ('00000000-0000-0000-0001-000000000014', NULL, 'Agachamento',            'legs'),
  ('00000000-0000-0000-0001-000000000015', NULL, 'Leg Press',              'legs'),
  ('00000000-0000-0000-0001-000000000016', NULL, 'Extensão de Quadríceps', 'legs'),
  ('00000000-0000-0000-0001-000000000017', NULL, 'Flexão de Joelho',       'legs'),
  ('00000000-0000-0000-0001-000000000018', NULL, 'Stiff',                  'glutes'),
  ('00000000-0000-0000-0001-000000000019', NULL, 'Afundo',                 'glutes'),
  ('00000000-0000-0000-0001-000000000020', NULL, 'Panturrilha em Pé',      'calves'),
  ('00000000-0000-0000-0001-000000000021', NULL, 'Prancha',                'core'),
  ('00000000-0000-0000-0001-000000000022', NULL, 'Abdominal Crunch',       'core')
ON CONFLICT (id) DO NOTHING;

-- ── Alimentos globais ─────────────────────────────────────────────
-- Mirrors FOOD_DATABASE from lib/mock-nutrition.ts

INSERT INTO food_items (
  id, user_id, name, brand,
  calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g,
  default_serving_g, serving_desc
) VALUES
  -- Proteínas
  ('00000000-0000-0000-0002-000000000001', NULL, 'Frango grelhado',        NULL,  165, 31.0,  0.0,  3.6,  150, '1 filé médio'),
  ('00000000-0000-0000-0002-000000000002', NULL, 'Ovo cozido',             NULL,  155, 12.6,  1.1, 10.6,   55, '1 unidade'),
  ('00000000-0000-0000-0002-000000000003', NULL, 'Whey Protein',           NULL,  400, 83.0, 10.0,  5.0,   30, '1 scoop (30g)'),
  ('00000000-0000-0000-0002-000000000004', NULL, 'Atum em lata',           NULL,  116, 25.5,  0.0,  0.8,  120, '1 lata'),
  ('00000000-0000-0000-0002-000000000005', NULL, 'Carne bovina (patinho)', NULL,  219, 30.0,  0.0, 10.4,  150, '1 bife'),
  ('00000000-0000-0000-0002-000000000006', NULL, 'Iogurte grego',          NULL,   97,  9.0,  6.0,  3.8,  200, '1 pote'),
  ('00000000-0000-0000-0002-000000000007', NULL, 'Queijo cottage',         NULL,   98, 11.1,  3.4,  4.3,  100, '4 colheres'),
  -- Carboidratos
  ('00000000-0000-0000-0002-000000000008', NULL, 'Arroz branco cozido',    NULL,  128,  2.7, 28.1,  0.3,  200, '1 escumadeira cheia'),
  ('00000000-0000-0000-0002-000000000009', NULL, 'Arroz integral cozido',  NULL,  124,  2.6, 25.8,  1.0,  200, '1 escumadeira cheia'),
  ('00000000-0000-0000-0002-000000000010', NULL, 'Batata doce cozida',     NULL,   86,  1.6, 20.1,  0.1,  200, '1 unidade média'),
  ('00000000-0000-0000-0002-000000000011', NULL, 'Aveia em flocos',        NULL,  394, 13.9, 66.6,  8.5,   40, '4 colheres de sopa'),
  ('00000000-0000-0000-0002-000000000012', NULL, 'Pão integral',           NULL,  247,  9.8, 45.9,  2.7,   50, '2 fatias'),
  ('00000000-0000-0000-0002-000000000013', NULL, 'Banana',                 NULL,   89,  1.1, 22.8,  0.3,  120, '1 unidade média'),
  ('00000000-0000-0000-0002-000000000014', NULL, 'Maçã',                   NULL,   52,  0.3, 13.8,  0.2,  150, '1 unidade'),
  -- Gorduras boas
  ('00000000-0000-0000-0002-000000000015', NULL, 'Azeite de oliva',        NULL,  884,  0.0,  0.0,100.0,   10, '1 colher de sopa'),
  ('00000000-0000-0000-0002-000000000016', NULL, 'Pasta de amendoim',      NULL,  588, 25.1, 21.5, 50.4,   32, '2 colheres de sopa'),
  ('00000000-0000-0000-0002-000000000017', NULL, 'Abacate',                NULL,  160,  2.0,  8.5, 14.7,   80, '1/2 unidade'),
  -- Outros
  ('00000000-0000-0000-0002-000000000018', NULL, 'Feijão cozido',          NULL,   77,  4.8, 13.6,  0.5,  180, '1 concha'),
  ('00000000-0000-0000-0002-000000000019', NULL, 'Leite desnatado',        NULL,   35,  3.5,  5.1,  0.1,  200, '1 copo'),
  ('00000000-0000-0000-0002-000000000020', NULL, 'Granola',                NULL,  471,  8.0, 69.0, 19.0,   40, '4 colheres de sopa')
ON CONFLICT (id) DO NOTHING;
