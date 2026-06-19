# Configuração do Supabase

Para que a aplicação funcione corretamente com o Supabase, você precisa criar as tabelas no banco de dados.

## Passo 1: Acessar o Supabase

1. Vá para https://app.supabase.com
2. Faça login com sua conta
3. Selecione o projeto **rifascura**

## Passo 2: Criar as Tabelas

Vá para **SQL Editor** e execute os seguintes comandos:

### Tabela: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: rifas (Sorteios)
```sql
CREATE TABLE rifas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_numeros INTEGER DEFAULT 100,
  preco_numero DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'ativa',
  data_sorteio TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: numeros_rifa (Números dos Sorteios)
```sql
CREATE TABLE numeros_rifa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rifa_id UUID REFERENCES rifas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  participante_id UUID,
  status VARCHAR(50) DEFAULT 'disponivel',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rifa_id, numero)
);
```

### Tabela: participantes (Participantes)
```sql
CREATE TABLE participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rifa_id UUID REFERENCES rifas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: transacoes (Transações/Pagamentos)
```sql
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rifa_id UUID REFERENCES rifas(id) ON DELETE CASCADE,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  tipo VARCHAR(50),
  metodo_pagamento VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Passo 3: Configurar Row Level Security (RLS)

Para cada tabela, execute:

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE numeros_rifa ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (permitir acesso público para desenvolvimento)
CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON rifas FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON numeros_rifa FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON participantes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON transacoes FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON rifas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON numeros_rifa FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON participantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON transacoes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON rifas FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON numeros_rifa FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON participantes FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON transacoes FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON users FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON rifas FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON numeros_rifa FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON participantes FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON transacoes FOR DELETE USING (true);
```

## Passo 4: Criar Storage Bucket

1. Vá para **Storage** no Supabase
2. Clique em **Create a new bucket**
3. Nome: `rifas-files`
4. Deixe como **Public**
5. Clique em **Create bucket**

## Passo 5: Testar a Conexão

Após criar as tabelas, a aplicação deve conectar automaticamente ao Supabase e começar a salvar dados!

Se tiver problemas, verifique:
- ✅ As variáveis de ambiente estão configuradas no Vercel
- ✅ As tabelas foram criadas no Supabase
- ✅ O RLS está habilitado corretamente
