-- ============================================
-- CRIAR TABELAS COM ESTRUTURA DOS DADOS REAIS
-- ============================================

-- Tabela: User (com dados do backup)
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

-- Tabela: Rifa (com dados do backup)
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

-- Tabela: NumeroRifa (será preenchida depois)
CREATE TABLE IF NOT EXISTS "NumeroRifa" (
  id TEXT PRIMARY KEY,
  rifa_id TEXT REFERENCES "Rifa"(id) ON DELETE CASCADE,
  numero INTEGER,
  comprador_nome TEXT,
  comprador_email TEXT,
  comprador_telefone TEXT,
  status TEXT DEFAULT 'disponivel',
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento TIMESTAMP,
  created_date TIMESTAMP,
  updated_date TIMESTAMP
);

-- ============================================
-- IMPORTAR DADOS DO BACKUP
-- ============================================

-- Inserir usuários do backup
INSERT INTO "User" (role, id, created_date, updated_date, email, full_name, disabled, disabled_reason, is_verified, force_password_reset, app_id, is_service, collaborator_role, _app_role)
VALUES
('admin','69b2cfca372dc73cfc07bdaf','2026-03-12T14:38:02.229000','2026-03-12T14:38:02.229000','missesrocker@gmail.com','Ariane Barbosa Rodrigues de Almeida','','',true,false,'69b2cfca372dc73cfc07bdae',false,'editor','admin'),
('user','69b41e961da9214a81d0d6dc','2026-03-13T14:26:30.928000','2026-03-13T14:26:30.928000','gab.moschini@gmail.com','Gabriela Moschini','','',true,false,'69b2cfca372dc73cfc07bdae',false,'','user'),
('user','69b421a5492e843d40493e36','2026-03-13T14:39:33.177000','2026-03-13T14:39:33.177000','oliviavicky@gmail.com','Olivia Alves','','',true,false,'69b2cfca372dc73cfc07bdae',false,'','user'),
('user','69b4224284de2176aad95c30','2026-03-13T14:42:10.175000','2026-03-13T14:42:32.005000','mayaraosouza35@gmail.com','mayaraosouza35','','',true,false,'69b2cfca372dc73cfc07bdae',false,'','user'),
('user','69b42a94d4cf3ce7737c82a0','2026-03-13T15:17:40.159000','2026-03-13T15:17:40.159000','rhlibuda@gmail.com','rafael ishii','','',true,false,'69b2cfca372dc73cfc07bdae',false,'','user')
ON CONFLICT (id) DO NOTHING;

-- Inserir rifas do backup
INSERT INTO "Rifa" (data_inicio, vendedor_responsavel, metodo_sorteio, nome_vencedor, nome, observacao_sorteio, descricao, data_fim, telefone_vencedor, valor_numero, numero_vencedor, data_sorteio, quantidade_numeros, slug, imagem_url, status, id, created_date, updated_date, created_by_id, created_by, is_sample)
VALUES
('2026-05-24','','','','Sorteio - Cesta "Date Junino"','','Sorteio - Cesta "Date Junino"','2026-06-27','',10,'','',200,'sorteio-cesta-date-junino-1778884002787','https://www.tendaatacado.com.br/dicas/wp-content/uploads/2024/05/festa-junina-sustentavel-topo-1.jpg','ativa','6a079d98a06775c26f4872bb','2026-05-15T22:26:32.789000','2026-05-25T00:01:18.921000','69b2cfca372dc73cfc07bdaf','missesrocker@gmail.com',false),
('2026-03-13','','automatico','Ana Beatriz Porto Vieira','Rifa de Páscoa','','Rifa para arrecadae fundos para o terreiro Centro de Umbanda Reino das Almas. Na compra de dois números, sairão 2 por R$ 10,00','2026-04-04','18997312912',7,'76','2026-04-04T20:45:43.600Z',200,'rifa-de-pascoa-1773426272945','https://www.serasaexperian.com.br/adobe/dynamicmedia/deliver/dm-aid--c9adc57d-a303-4a3d-9f45-b2ea4f52a9c0/banner-frases-para-usar-na-pascoa.jpg.webp?width=740&quality=85','finalizada','69b455234e6934e74b320dc1','2026-03-13T18:19:15.587000','2026-04-04T20:45:43.842000','anonymous','anonymous',false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONFIGURAR PERMISSÕES (RLS)
-- ============================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rifa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NumeroRifa" ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Allow public read" ON "User" FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON "Rifa" FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON "NumeroRifa" FOR SELECT USING (true);

-- Permitir inserção, atualização e deleção (será restringido no frontend)
CREATE POLICY "Allow all operations" ON "User" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all operations" ON "User" FOR UPDATE USING (true);
CREATE POLICY "Allow all operations" ON "User" FOR DELETE USING (true);

CREATE POLICY "Allow all operations" ON "Rifa" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all operations" ON "Rifa" FOR UPDATE USING (true);
CREATE POLICY "Allow all operations" ON "Rifa" FOR DELETE USING (true);

CREATE POLICY "Allow all operations" ON "NumeroRifa" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all operations" ON "NumeroRifa" FOR UPDATE USING (true);
CREATE POLICY "Allow all operations" ON "NumeroRifa" FOR DELETE USING (true);
