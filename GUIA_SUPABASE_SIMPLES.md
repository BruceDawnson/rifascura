# 🚀 Guia Simples - Importar Dados no Supabase

## Passo 1: Abrir o Supabase

1. Vá para: https://app.supabase.com
2. Faça login
3. Selecione seu projeto **rifascura**

## Passo 2: Importar Dados

1. Clique em **SQL Editor** (menu esquerdo)
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `SUPABASE_IMPORT.sql` (está no GitHub)
4. Cole no editor
5. Clique em **Run**

Pronto! ✅ As tabelas serão criadas e os dados importados automaticamente.

## Passo 3: Criar Usuários de Login

Agora você precisa criar 2 usuários para login:

1. Vá para **Authentication** (menu esquerdo)
2. Clique em **Users**
3. Clique em **Add user**

### Usuário 1 - Admin
- **Email**: curaterreiro@gmail.com
- **Password**: Mei@noite333!
- Clique em **Create user**

### Usuário 2 - Operador
- **Email**: operador@cura.com
- **Password**: Curaterreiro777!
- Clique em **Create user**

## ✅ Pronto!

Agora você tem:
- ✅ Tabelas criadas (User, Rifa, NumeroRifa)
- ✅ Dados importados do backup
- ✅ 2 usuários para login

Próximo passo: Fazer **Redeploy** no Vercel! 🎯
