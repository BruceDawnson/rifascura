# Configuração Final do Supabase - Rifascura

## 📋 Estrutura de Tabelas

Execute os seguintes comandos no **SQL Editor** do Supabase:

### 1. Criar Tabela: User

```sql
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'operador',
  password_hash VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE,
  disabled_reason TEXT,
  force_password_reset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para User
CREATE POLICY "Users can view their own data" ON "User" FOR SELECT USING (auth.uid()::text = id::text OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
CREATE POLICY "Admin can view all users" ON "User" FOR SELECT USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
CREATE POLICY "Admin can insert users" ON "User" FOR INSERT WITH CHECK (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
CREATE POLICY "Admin can update users" ON "User" FOR UPDATE USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
CREATE POLICY "Admin can delete users" ON "User" FOR DELETE USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
```

### 2. Criar Tabela: Rifa

```sql
CREATE TABLE IF NOT EXISTS "Rifa" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_numeros INTEGER DEFAULT 100,
  preco_numero DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'ativa',
  data_sorteio TIMESTAMP,
  numero_sorteado INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "Rifa" ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para Rifa
CREATE POLICY "Anyone can view rifas" ON "Rifa" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rifas" ON "Rifa" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update rifas" ON "Rifa" FOR UPDATE USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
CREATE POLICY "Admin can delete rifas" ON "Rifa" FOR DELETE USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
```

### 3. Criar Tabela: NumeroRifa

```sql
CREATE TABLE IF NOT EXISTS "NumeroRifa" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rifa_id UUID REFERENCES "Rifa"(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  comprador_nome VARCHAR(255),
  comprador_email VARCHAR(255),
  comprador_telefone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'disponivel',
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rifa_id, numero)
);

ALTER TABLE "NumeroRifa" ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para NumeroRifa
CREATE POLICY "Anyone can view numeros" ON "NumeroRifa" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create numeros" ON "NumeroRifa" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Operador can update numeros" ON "NumeroRifa" FOR UPDATE USING (true);
CREATE POLICY "Admin can delete numeros" ON "NumeroRifa" FOR DELETE USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin');
```

## 🔐 Configurar Autenticação

### Criar Usuários no Supabase Auth

1. Vá para **Authentication** → **Users**
2. Clique em **Add user**
3. Crie os seguintes usuários:

#### Admin
- **Email**: curaterreiro@gmail.com
- **Password**: Mei@noite333!
- **Role**: admin

#### Operador
- **Email**: operador@cura.com
- **Password**: Curaterreiro777!
- **Role**: operador

## 📝 Inserir Dados de Usuários

Após criar os usuários no Auth, execute este SQL para criar os registros na tabela User:

```sql
INSERT INTO "User" (id, email, full_name, role, is_verified, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'curaterreiro@gmail.com', 'Admin User', 'admin', TRUE, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'operador@cura.com', 'Operador', 'operador', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

## 🎯 Permissões por Papel

### Admin (curaterreiro@gmail.com)
- ✅ Criar sorteios
- ✅ Editar sorteios
- ✅ Excluir sorteios
- ✅ Realizar sorteios
- ✅ Exportar CSV
- ✅ Ver relatórios
- ✅ Acessar configurações
- ✅ Gerenciar usuários

### Operador (operador@cura.com)
- ✅ Ver Dashboard
- ✅ Ver lista de Sorteios
- ✅ Editar números (marcar pago/não pago, adicionar comprador)
- ❌ Criar sorteios
- ❌ Editar sorteios
- ❌ Excluir sorteios
- ❌ Realizar sorteios
- ❌ Exportar CSV
- ❌ Ver relatórios
- ❌ Acessar configurações

## ✅ Próximos Passos

1. Execute todos os comandos SQL acima no Supabase SQL Editor
2. Crie os usuários no Supabase Authentication
3. Teste o login com ambas as contas
4. Verifique as permissões de acesso
