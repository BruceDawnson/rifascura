-- ============================================
-- SETUP CORRETO DO SUPABASE - RIFASCURA
-- Com a estrutura EXATA dos CSVs
-- ============================================

-- Passo 1: Criar Tabela User
-- ============================================

CREATE TABLE IF NOT EXISTS "User" (
  role TEXT,
  id TEXT PRIMARY KEY,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  email TEXT UNIQUE,
  full_name TEXT,
  disabled TEXT,
  disabled_reason TEXT,
  is_verified BOOLEAN,
  force_password_reset BOOLEAN,
  app_id TEXT,
  is_service BOOLEAN,
  collaborator_role TEXT,
  _app_role TEXT
);

-- Passo 2: Criar Tabela Rifa
-- ============================================

CREATE TABLE IF NOT EXISTS "Rifa" (
  data_inicio DATE,
  vendedor_responsavel TEXT,
  metodo_sorteio TEXT,
  nome_vencedor TEXT,
  nome TEXT,
  observacao_sorteio TEXT,
  descricao TEXT,
  data_fim DATE,
  telefone_vencedor TEXT,
  valor_numero DECIMAL(10, 2),
  numero_vencedor TEXT,
  data_sorteio TIMESTAMP,
  quantidade_numeros INTEGER,
  slug TEXT UNIQUE,
  imagem_url TEXT,
  status TEXT,
  id TEXT PRIMARY KEY,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  created_by_id TEXT,
  created_by TEXT,
  is_sample BOOLEAN
);

-- Passo 3: Criar Tabela NumeroRifa
-- ============================================

CREATE TABLE IF NOT EXISTS "NumeroRifa" (
  telefone TEXT,
  observacao TEXT,
  numero INTEGER,
  nome_vendedor TEXT,
  rifa_id TEXT REFERENCES "Rifa"(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10, 2),
  vendido BOOLEAN,
  nome_comprador TEXT,
  pago BOOLEAN,
  data_compra TIMESTAMP,
  id TEXT PRIMARY KEY,
  created_date TIMESTAMP,
  updated_date TIMESTAMP,
  created_by_id TEXT,
  created_by TEXT,
  is_sample BOOLEAN
);

-- Passo 4: Habilitar RLS
-- ============================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rifa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NumeroRifa" ENABLE ROW LEVEL SECURITY;

-- Passo 5: Criar Políticas de Acesso
-- ============================================

-- User policies
CREATE POLICY "Allow public read" ON "User" FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON "User" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON "User" FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON "User" FOR DELETE USING (true);

-- Rifa policies
CREATE POLICY "Allow public read" ON "Rifa" FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON "Rifa" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON "Rifa" FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON "Rifa" FOR DELETE USING (true);

-- NumeroRifa policies
CREATE POLICY "Allow public read" ON "NumeroRifa" FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON "NumeroRifa" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON "NumeroRifa" FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON "NumeroRifa" FOR DELETE USING (true);

-- ============================================
-- ✅ PRONTO! Tabelas criadas com estrutura correta
-- ============================================
-- Agora você pode fazer upload dos CSVs direto no Supabase!
