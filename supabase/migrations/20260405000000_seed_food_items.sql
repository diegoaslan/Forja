-- ══════════════════════════════════════════════════════════════════
-- FORJA — Seed de alimentos: TACO 4ª ed. (NEPA-UNICAMP, 2011)
-- Versão: 20260405000000
--
-- Fonte primária: Tabela Brasileira de Composição de Alimentos (TACO),
--   4ª Edição Revisada e Ampliada, NEPA / UNICAMP, Campinas, 2011.
--   ISBN 978-85-85129-36-4
--   Todos os valores são por 100g de alimento no estado descrito.
--
-- Regras de proteção:
--   • user_id IS NULL → alimento global (visível para todos os usuários)
--   • brand = 'TACO'  → rastreabilidade da fonte
--   • UPDATEs (range 0002): cláusula AND user_id IS NULL garante que
--     apenas alimentos globais são modificados — alimentos criados por
--     usuários (user_id NOT NULL) nunca são tocados.
--   • INSERTs (range 0003): ON CONFLICT (id) DO UPDATE ...
--     WHERE food_items.user_id IS NULL garante idempotência segura —
--     se por qualquer razão um item com mesmo id pertencer a um usuário,
--     o update é suprimido.
--   • Idempotente: pode ser re-executada sem efeito colateral.
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Corrigir os 20 alimentos do seed inicial (valores inexatos) ─

UPDATE food_items SET
  name = 'Frango, peito, sem pele, grelhado',
  brand = 'TACO',
  calories_per_100g = 159, protein_per_100g = 32.0,
  carbs_per_100g = 0.0,  fats_per_100g = 3.2,
  default_serving_g = 150, serving_desc = '1 filé médio (150g)'
WHERE id = '00000000-0000-0000-0002-000000000001' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Ovo de galinha, inteiro, cozido',
  brand = 'TACO',
  calories_per_100g = 146, protein_per_100g = 13.3,
  carbs_per_100g = 0.6,  fats_per_100g = 9.5,
  default_serving_g = 50, serving_desc = '1 unidade (50g)'
WHERE id = '00000000-0000-0000-0002-000000000002' AND user_id IS NULL;

-- Whey protein não consta no TACO (suplemento). Mantido com valores típicos de rótulo.
UPDATE food_items SET
  name = 'Whey protein concentrado',
  brand = 'Rótulo típico',
  calories_per_100g = 400, protein_per_100g = 80.0,
  carbs_per_100g = 8.0,  fats_per_100g = 7.0,
  default_serving_g = 30, serving_desc = '1 scoop (30g)'
WHERE id = '00000000-0000-0000-0002-000000000003' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Atum, em lata, em água, drenado',
  brand = 'TACO',
  calories_per_100g = 128, protein_per_100g = 29.6,
  carbs_per_100g = 0.0,  fats_per_100g = 1.1,
  default_serving_g = 120, serving_desc = '1 lata drenada (120g)'
WHERE id = '00000000-0000-0000-0002-000000000004' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Carne bovina, patinho, grelhado',
  brand = 'TACO',
  calories_per_100g = 219, protein_per_100g = 33.1,
  carbs_per_100g = 0.0,  fats_per_100g = 8.9,
  default_serving_g = 150, serving_desc = '1 bife (150g)'
WHERE id = '00000000-0000-0000-0002-000000000005' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Iogurte natural integral',
  brand = 'TACO',
  calories_per_100g = 51,  protein_per_100g = 3.9,
  carbs_per_100g = 5.0,  fats_per_100g = 1.8,
  default_serving_g = 200, serving_desc = '1 pote (200g)'
WHERE id = '00000000-0000-0000-0002-000000000006' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Queijo cottage',
  brand = 'TACO',
  calories_per_100g = 98,  protein_per_100g = 11.1,
  carbs_per_100g = 3.4,  fats_per_100g = 4.3,
  default_serving_g = 100, serving_desc = '4 colheres de sopa (100g)'
WHERE id = '00000000-0000-0000-0002-000000000007' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Arroz branco polido, cozido',
  brand = 'TACO',
  calories_per_100g = 128, protein_per_100g = 2.5,
  carbs_per_100g = 28.1, fats_per_100g = 0.2,
  default_serving_g = 200, serving_desc = '1 escumadeira (200g)'
WHERE id = '00000000-0000-0000-0002-000000000008' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Arroz integral, cozido',
  brand = 'TACO',
  calories_per_100g = 124, protein_per_100g = 2.6,
  carbs_per_100g = 25.8, fats_per_100g = 1.0,
  default_serving_g = 200, serving_desc = '1 escumadeira (200g)'
WHERE id = '00000000-0000-0000-0002-000000000009' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Batata doce, cozida',
  brand = 'TACO',
  calories_per_100g = 77,  protein_per_100g = 0.6,
  carbs_per_100g = 18.4, fats_per_100g = 0.1,
  default_serving_g = 200, serving_desc = '1 unidade média (200g)'
WHERE id = '00000000-0000-0000-0002-000000000010' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Aveia em flocos',
  brand = 'TACO',
  calories_per_100g = 394, protein_per_100g = 13.9,
  carbs_per_100g = 66.6, fats_per_100g = 8.5,
  default_serving_g = 40, serving_desc = '4 colheres de sopa (40g)'
WHERE id = '00000000-0000-0000-0002-000000000011' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Pão de forma integral',
  brand = 'TACO',
  calories_per_100g = 253, protein_per_100g = 8.0,
  carbs_per_100g = 43.9, fats_per_100g = 4.1,
  default_serving_g = 50, serving_desc = '2 fatias (50g)'
WHERE id = '00000000-0000-0000-0002-000000000012' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Banana prata',
  brand = 'TACO',
  calories_per_100g = 98,  protein_per_100g = 1.3,
  carbs_per_100g = 26.0, fats_per_100g = 0.1,
  default_serving_g = 100, serving_desc = '1 unidade média (100g)'
WHERE id = '00000000-0000-0000-0002-000000000013' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Maçã fuji',
  brand = 'TACO',
  calories_per_100g = 56,  protein_per_100g = 0.3,
  carbs_per_100g = 15.2, fats_per_100g = 0.1,
  default_serving_g = 150, serving_desc = '1 unidade (150g)'
WHERE id = '00000000-0000-0000-0002-000000000014' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Azeite de oliva',
  brand = 'TACO',
  calories_per_100g = 884, protein_per_100g = 0.0,
  carbs_per_100g = 0.0,  fats_per_100g = 100.0,
  default_serving_g = 10, serving_desc = '1 colher de sopa (10g)'
WHERE id = '00000000-0000-0000-0002-000000000015' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Pasta de amendoim',
  brand = 'TACO',
  calories_per_100g = 598, protein_per_100g = 24.4,
  carbs_per_100g = 21.4, fats_per_100g = 49.9,
  default_serving_g = 32, serving_desc = '2 colheres de sopa (32g)'
WHERE id = '00000000-0000-0000-0002-000000000016' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Abacate',
  brand = 'TACO',
  calories_per_100g = 96,  protein_per_100g = 1.2,
  carbs_per_100g = 6.0,  fats_per_100g = 8.4,
  default_serving_g = 80, serving_desc = '1/2 unidade (80g)'
WHERE id = '00000000-0000-0000-0002-000000000017' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Feijão carioca, cozido',
  brand = 'TACO',
  calories_per_100g = 76,  protein_per_100g = 4.8,
  carbs_per_100g = 13.6, fats_per_100g = 0.5,
  default_serving_g = 180, serving_desc = '1 concha (180g)'
WHERE id = '00000000-0000-0000-0002-000000000018' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Leite de vaca, desnatado',
  brand = 'TACO',
  calories_per_100g = 35,  protein_per_100g = 3.4,
  carbs_per_100g = 5.0,  fats_per_100g = 0.2,
  default_serving_g = 200, serving_desc = '1 copo (200ml)'
WHERE id = '00000000-0000-0000-0002-000000000019' AND user_id IS NULL;

UPDATE food_items SET
  name = 'Granola',
  brand = 'TACO',
  calories_per_100g = 471, protein_per_100g = 8.0,
  carbs_per_100g = 69.0, fats_per_100g = 19.0,
  default_serving_g = 40, serving_desc = '4 colheres de sopa (40g)'
WHERE id = '00000000-0000-0000-0002-000000000020' AND user_id IS NULL;

-- ── 2. Inserir novos alimentos TACO (0003 range) ───────────────────

INSERT INTO food_items (
  id, user_id, name, brand,
  calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g,
  default_serving_g, serving_desc
) VALUES

-- ── Cereais e derivados ──────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000001', NULL,
    'Macarrão de grano duro, cozido', 'TACO',
    111, 3.5, 23.3, 0.3, 200, '1 prato fundo (200g)'
  ),
  (
    '00000000-0000-0000-0003-000000000002', NULL,
    'Pão francês', 'TACO',
    300, 9.4, 58.6, 3.1, 50, '1 unidade (50g)'
  ),
  (
    '00000000-0000-0000-0003-000000000003', NULL,
    'Tapioca, goma hidratada', 'TACO',
    82, 0.3, 19.9, 0.0, 100, '1 tapioca pequena (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000004', NULL,
    'Farinha de mandioca, torrada', 'TACO',
    361, 1.0, 88.4, 0.3, 25, '2 colheres de sopa (25g)'
  ),

-- ── Leguminosas ──────────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000005', NULL,
    'Feijão preto, cozido', 'TACO',
    77, 4.5, 14.0, 0.5, 180, '1 concha (180g)'
  ),
  (
    '00000000-0000-0000-0003-000000000006', NULL,
    'Lentilha, cozida', 'TACO',
    93, 7.9, 17.5, 0.5, 180, '1 concha (180g)'
  ),
  (
    '00000000-0000-0000-0003-000000000007', NULL,
    'Grão de bico, cozido', 'TACO',
    129, 6.9, 24.1, 2.1, 180, '1 concha (180g)'
  ),
  (
    '00000000-0000-0000-0003-000000000008', NULL,
    'Ervilha verde, enlatada', 'TACO',
    59, 3.9, 9.8, 0.4, 80, '4 colheres de sopa (80g)'
  ),

-- ── Carnes e aves ────────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000009', NULL,
    'Frango, coxa, sem pele, assada', 'TACO',
    215, 26.5, 0.0, 12.1, 120, '1 coxa (120g)'
  ),
  (
    '00000000-0000-0000-0003-000000000010', NULL,
    'Carne bovina, alcatra, grelhada', 'TACO',
    183, 31.0, 0.0, 6.0, 150, '1 bife (150g)'
  ),
  (
    '00000000-0000-0000-0003-000000000011', NULL,
    'Carne bovina, coxão mole, cozido', 'TACO',
    187, 29.6, 0.0, 7.0, 150, '1 bife (150g)'
  ),
  (
    '00000000-0000-0000-0003-000000000012', NULL,
    'Carne bovina, patinho moído, refogado', 'TACO',
    219, 29.0, 0.0, 11.3, 150, '1 porção (150g)'
  ),
  (
    '00000000-0000-0000-0003-000000000013', NULL,
    'Carne suína, lombo, assado', 'TACO',
    234, 29.8, 0.0, 12.9, 150, '1 fatia (150g)'
  ),

-- ── Pescados ─────────────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000014', NULL,
    'Tilápia, filé, assado', 'TACO',
    128, 26.5, 0.0, 2.2, 150, '1 filé (150g)'
  ),
  (
    '00000000-0000-0000-0003-000000000015', NULL,
    'Salmão, filé, grelhado', 'TACO',
    182, 23.8, 0.0, 9.2, 150, '1 filé (150g)'
  ),
  (
    '00000000-0000-0000-0003-000000000016', NULL,
    'Sardinha em lata, em óleo, drenada', 'TACO',
    270, 27.0, 0.0, 17.6, 100, '1/2 lata (100g)'
  ),

-- ── Ovos e laticínios ────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000017', NULL,
    'Ovo de galinha, clara, cozida', 'TACO',
    52, 10.9, 0.8, 0.2, 35, '1 clara (35g)'
  ),
  (
    '00000000-0000-0000-0003-000000000018', NULL,
    'Leite de vaca, integral', 'TACO',
    61, 3.2, 4.8, 3.3, 200, '1 copo (200ml)'
  ),
  (
    '00000000-0000-0000-0003-000000000019', NULL,
    'Queijo minas frescal', 'TACO',
    264, 17.4, 3.0, 20.2, 100, '4 fatias finas (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000020', NULL,
    'Queijo muçarela', 'TACO',
    329, 27.0, 2.8, 23.0, 30, '3 fatias (30g)'
  ),
  (
    '00000000-0000-0000-0003-000000000021', NULL,
    'Requeijão cremoso', 'TACO',
    281, 7.4, 2.7, 26.2, 30, '2 colheres de sopa (30g)'
  ),

-- ── Frutas ───────────────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000022', NULL,
    'Banana nanica', 'TACO',
    92, 1.4, 23.8, 0.1, 100, '1 unidade média (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000023', NULL,
    'Laranja pêra', 'TACO',
    37, 1.0, 8.9, 0.1, 180, '1 unidade (180g)'
  ),
  (
    '00000000-0000-0000-0003-000000000024', NULL,
    'Mamão papaia', 'TACO',
    40, 0.5, 10.2, 0.1, 250, '1 fatia grande (250g)'
  ),
  (
    '00000000-0000-0000-0003-000000000025', NULL,
    'Manga Tommy', 'TACO',
    64, 0.7, 16.8, 0.2, 200, '1/2 manga (200g)'
  ),
  (
    '00000000-0000-0000-0003-000000000026', NULL,
    'Morango', 'TACO',
    30, 0.8, 6.8, 0.3, 100, '8 unidades (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000027', NULL,
    'Melancia', 'TACO',
    30, 0.9, 7.4, 0.2, 300, '1 fatia (300g)'
  ),
  (
    '00000000-0000-0000-0003-000000000028', NULL,
    'Uva itália', 'TACO',
    68, 0.6, 17.3, 0.1, 100, '1 cacho pequeno (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000029', NULL,
    'Abacaxi', 'TACO',
    48, 0.9, 12.3, 0.1, 150, '1 fatia (150g)'
  ),

-- ── Verduras e legumes ───────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000030', NULL,
    'Batata inglesa, cozida', 'TACO',
    52, 1.2, 11.9, 0.1, 200, '1 unidade média (200g)'
  ),
  (
    '00000000-0000-0000-0003-000000000031', NULL,
    'Mandioca, cozida', 'TACO',
    125, 0.8, 30.1, 0.3, 200, '1 pedaço (200g)'
  ),
  (
    '00000000-0000-0000-0003-000000000032', NULL,
    'Cenoura, crua', 'TACO',
    34, 1.3, 7.7, 0.2, 80, '1 unidade média (80g)'
  ),
  (
    '00000000-0000-0000-0003-000000000033', NULL,
    'Brócolis, cozido', 'TACO',
    27, 2.6, 3.8, 0.4, 100, '1 ramo (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000034', NULL,
    'Espinafre, cozido', 'TACO',
    22, 2.8, 2.4, 0.4, 100, '1 porção (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000035', NULL,
    'Tomate, cru', 'TACO',
    15, 0.9, 3.1, 0.2, 100, '1 unidade média (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000036', NULL,
    'Alface, crua', 'TACO',
    11, 1.3, 1.7, 0.2, 60, '3 folhas (60g)'
  ),
  (
    '00000000-0000-0000-0003-000000000037', NULL,
    'Abobrinha, cozida', 'TACO',
    19, 1.4, 3.8, 0.2, 100, '1 porção (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000038', NULL,
    'Chuchu, cozido', 'TACO',
    19, 0.6, 4.5, 0.1, 100, '1 porção (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000039', NULL,
    'Couve, refogada', 'TACO',
    27, 2.1, 4.3, 0.6, 60, '3 colheres de sopa (60g)'
  ),
  (
    '00000000-0000-0000-0003-000000000040', NULL,
    'Inhame, cozido', 'TACO',
    95, 1.3, 22.3, 0.1, 150, '1 pedaço (150g)'
  ),
  (
    '00000000-0000-0000-0003-000000000041', NULL,
    'Pepino, cru', 'TACO',
    13, 0.6, 2.9, 0.1, 100, '1/2 unidade (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000042', NULL,
    'Beterraba, cozida', 'TACO',
    37, 1.7, 7.7, 0.1, 100, '1 unidade pequena (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000043', NULL,
    'Repolho, cozido', 'TACO',
    16, 1.0, 3.3, 0.2, 100, '1 porção (100g)'
  ),
  (
    '00000000-0000-0000-0003-000000000044', NULL,
    'Cebola, crua', 'TACO',
    30, 0.9, 7.2, 0.1, 60, '1/2 unidade (60g)'
  ),

-- ── Oleaginosas ──────────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000045', NULL,
    'Amendoim, torrado', 'TACO',
    581, 24.4, 20.9, 47.8, 30, '1 punhado (30g)'
  ),
  (
    '00000000-0000-0000-0003-000000000046', NULL,
    'Castanha de caju, torrada', 'TACO',
    570, 17.7, 25.2, 46.3, 30, '1 punhado (30g)'
  ),
  (
    '00000000-0000-0000-0003-000000000047', NULL,
    'Castanha do Pará', 'TACO',
    644, 14.3, 12.3, 63.2, 20, '2 unidades (20g)'
  ),
  (
    '00000000-0000-0000-0003-000000000048', NULL,
    'Amêndoa, torrada', 'TACO',
    603, 19.4, 19.7, 52.8, 25, '1 punhado (25g)'
  ),

-- ── Gorduras e óleos ─────────────────────────────────────────────

  (
    '00000000-0000-0000-0003-000000000049', NULL,
    'Óleo de soja', 'TACO',
    884, 0.0, 0.0, 100.0, 10, '1 colher de sopa (10g)'
  ),
  (
    '00000000-0000-0000-0003-000000000050', NULL,
    'Manteiga com sal', 'TACO',
    726, 0.9, 0.1, 83.2, 10, '1 colher de chá (10g)'
  )

ON CONFLICT (id) DO UPDATE SET
  name               = EXCLUDED.name,
  brand              = EXCLUDED.brand,
  calories_per_100g  = EXCLUDED.calories_per_100g,
  protein_per_100g   = EXCLUDED.protein_per_100g,
  carbs_per_100g     = EXCLUDED.carbs_per_100g,
  fats_per_100g      = EXCLUDED.fats_per_100g,
  default_serving_g  = EXCLUDED.default_serving_g,
  serving_desc       = EXCLUDED.serving_desc
-- Proteção explícita: nunca sobrescreve alimentos criados por usuários.
-- (user_id NOT NULL = alimento personalizado do usuário)
WHERE food_items.user_id IS NULL;
