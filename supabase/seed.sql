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
-- Fonte: TACO — Tabela Brasileira de Composição de Alimentos,
--        4ª Edição, NEPA-UNICAMP, 2011.
-- Valores por 100g. user_id IS NULL = alimento global.
-- Nota: a migration 20260405000000_seed_food_items.sql contém
--       o conjunto completo (~70 alimentos) e corrige estes valores.

INSERT INTO food_items (
  id, user_id, name, brand,
  calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g,
  default_serving_g, serving_desc
) VALUES
  -- Proteínas animais
  ('00000000-0000-0000-0002-000000000001', NULL, 'Frango, peito, sem pele, grelhado', 'TACO', 159, 32.0,  0.0,  3.2, 150, '1 filé médio (150g)'),
  ('00000000-0000-0000-0002-000000000002', NULL, 'Ovo de galinha, inteiro, cozido',   'TACO', 146, 13.3,  0.6,  9.5,  50, '1 unidade (50g)'),
  ('00000000-0000-0000-0002-000000000003', NULL, 'Whey protein concentrado',  'Rótulo típico', 400, 80.0,  8.0,  7.0,  30, '1 scoop (30g)'),
  ('00000000-0000-0000-0002-000000000004', NULL, 'Atum, em lata, em água, drenado',   'TACO', 128, 29.6,  0.0,  1.1, 120, '1 lata drenada (120g)'),
  ('00000000-0000-0000-0002-000000000005', NULL, 'Carne bovina, patinho, grelhado',   'TACO', 219, 33.1,  0.0,  8.9, 150, '1 bife (150g)'),
  ('00000000-0000-0000-0002-000000000006', NULL, 'Iogurte natural integral',          'TACO',  51,  3.9,  5.0,  1.8, 200, '1 pote (200g)'),
  ('00000000-0000-0000-0002-000000000007', NULL, 'Queijo cottage',                    'TACO',  98, 11.1,  3.4,  4.3, 100, '4 colheres de sopa (100g)'),
  -- Cereais e carboidratos
  ('00000000-0000-0000-0002-000000000008', NULL, 'Arroz branco polido, cozido',       'TACO', 128,  2.5, 28.1,  0.2, 200, '1 escumadeira (200g)'),
  ('00000000-0000-0000-0002-000000000009', NULL, 'Arroz integral, cozido',            'TACO', 124,  2.6, 25.8,  1.0, 200, '1 escumadeira (200g)'),
  ('00000000-0000-0000-0002-000000000010', NULL, 'Batata doce, cozida',               'TACO',  77,  0.6, 18.4,  0.1, 200, '1 unidade média (200g)'),
  ('00000000-0000-0000-0002-000000000011', NULL, 'Aveia em flocos',                   'TACO', 394, 13.9, 66.6,  8.5,  40, '4 colheres de sopa (40g)'),
  ('00000000-0000-0000-0002-000000000012', NULL, 'Pão de forma integral',             'TACO', 253,  8.0, 43.9,  4.1,  50, '2 fatias (50g)'),
  ('00000000-0000-0000-0002-000000000013', NULL, 'Banana prata',                      'TACO',  98,  1.3, 26.0,  0.1, 100, '1 unidade média (100g)'),
  ('00000000-0000-0000-0002-000000000014', NULL, 'Maçã fuji',                         'TACO',  56,  0.3, 15.2,  0.1, 150, '1 unidade (150g)'),
  -- Gorduras
  ('00000000-0000-0000-0002-000000000015', NULL, 'Azeite de oliva',                   'TACO', 884,  0.0,  0.0,100.0,  10, '1 colher de sopa (10g)'),
  ('00000000-0000-0000-0002-000000000016', NULL, 'Pasta de amendoim',                 'TACO', 598, 24.4, 21.4, 49.9,  32, '2 colheres de sopa (32g)'),
  ('00000000-0000-0000-0002-000000000017', NULL, 'Abacate',                           'TACO',  96,  1.2,  6.0,  8.4,  80, '1/2 unidade (80g)'),
  -- Outros
  ('00000000-0000-0000-0002-000000000018', NULL, 'Feijão carioca, cozido',            'TACO',  76,  4.8, 13.6,  0.5, 180, '1 concha (180g)'),
  ('00000000-0000-0000-0002-000000000019', NULL, 'Leite de vaca, desnatado',          'TACO',  35,  3.4,  5.0,  0.2, 200, '1 copo (200ml)'),
  ('00000000-0000-0000-0002-000000000020', NULL, 'Granola',                           'TACO', 471,  8.0, 69.0, 19.0,  40, '4 colheres de sopa (40g)')
ON CONFLICT (id) DO NOTHING;
